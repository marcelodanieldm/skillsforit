-- Sprint 28: Cart Recovery System
-- Sistema de recuperación de carritos abandonados

-- =====================================================
-- 1. TABLA DE CARRITOS ABANDONADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario
  user_email TEXT NOT NULL,
  user_id TEXT, -- Opcional, puede ser sesión anónima
  
  -- Datos del carrito
  cart_data JSONB NOT NULL, -- { ebook: true, cv_audit: true, mentorship: false, prices: {...} }
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stripe Session
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Estado del carrito
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'expired', 'failed')),
  
  -- Timestamps de eventos
  cart_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  abandoned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recovered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- 7 días después de abandonar
  
  -- Recovery tracking
  recovery_emails_sent INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_method TEXT, -- 'email_1', 'email_2', 'manual', null
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_abandoned_carts_email ON abandoned_carts(user_email);
CREATE INDEX idx_abandoned_carts_status ON abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_abandoned_at ON abandoned_carts(abandoned_at DESC);
CREATE INDEX idx_abandoned_carts_stripe_session ON abandoned_carts(stripe_session_id);
CREATE INDEX idx_abandoned_carts_expires ON abandoned_carts(expires_at);

-- =====================================================
-- 2. TABLA DE RECOVERY EMAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS recovery_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con carrito
  abandoned_cart_id UUID NOT NULL REFERENCES abandoned_carts(id) ON DELETE CASCADE,
  
  -- Email details
  email_type TEXT NOT NULL CHECK (email_type IN ('hour_1', 'hour_24')),
  recipient_email TEXT NOT NULL,
  
  -- Contenido
  subject TEXT NOT NULL,
  body_preview TEXT,
  
  -- Coupon (solo para email_2)
  coupon_code TEXT,
  coupon_discount_percent INTEGER,
  coupon_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Magic Link
  magic_link TEXT NOT NULL,
  magic_token TEXT NOT NULL UNIQUE,
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  -- Provider
  email_provider TEXT DEFAULT 'resend',
  provider_message_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'converted', 'bounced', 'failed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_recovery_emails_cart ON recovery_emails(abandoned_cart_id);
CREATE INDEX idx_recovery_emails_token ON recovery_emails(magic_token);
CREATE INDEX idx_recovery_emails_sent_at ON recovery_emails(sent_at DESC);
CREATE INDEX idx_recovery_emails_status ON recovery_emails(status);

-- =====================================================
-- 3. TABLA DE RECOVERY COUPONS
-- =====================================================

CREATE TABLE IF NOT EXISTS recovery_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación
  abandoned_cart_id UUID NOT NULL REFERENCES abandoned_carts(id) ON DELETE CASCADE,
  recovery_email_id UUID REFERENCES recovery_emails(id),
  
  -- Coupon details
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  
  -- Stripe
  stripe_coupon_id TEXT UNIQUE,
  stripe_promotion_code_id TEXT,
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL, -- 12 horas de validez
  
  -- Usage
  max_uses INTEGER DEFAULT 1,
  times_used INTEGER DEFAULT 0,
  used_by_email TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'invalid')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_recovery_coupons_code ON recovery_coupons(code);
CREATE INDEX idx_recovery_coupons_cart ON recovery_coupons(abandoned_cart_id);
CREATE INDEX idx_recovery_coupons_stripe ON recovery_coupons(stripe_coupon_id);
CREATE INDEX idx_recovery_coupons_status ON recovery_coupons(status);
CREATE INDEX idx_recovery_coupons_valid_until ON recovery_coupons(valid_until);

-- =====================================================
-- 4. TRIGGERS PARA TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_recovery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_abandoned_carts_updated
BEFORE UPDATE ON abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION update_recovery_timestamp();

CREATE TRIGGER trigger_recovery_coupons_updated
BEFORE UPDATE ON recovery_coupons
FOR EACH ROW
EXECUTE FUNCTION update_recovery_timestamp();

-- =====================================================
-- 5. FUNCIÓN PARA EXPIRAR CUPONES AUTOMÁTICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_coupons()
RETURNS void AS $$
BEGIN
  UPDATE recovery_coupons
  SET status = 'expired'
  WHERE status = 'active'
    AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN PARA MARCAR CARRITOS COMO EXPIRADOS
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_carts()
RETURNS void AS $$
BEGIN
  UPDATE abandoned_carts
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VISTA DE ANALYTICS DE RECUPERACIÓN
-- =====================================================

CREATE OR REPLACE VIEW cart_recovery_analytics AS
WITH recovery_stats AS (
  SELECT 
    COUNT(*) AS total_abandoned,
    COUNT(*) FILTER (WHERE status = 'recovered') AS total_recovered,
    COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
    COUNT(*) FILTER (WHERE status = 'expired') AS total_expired,
    SUM(total_amount) AS total_abandoned_revenue,
    SUM(total_amount) FILTER (WHERE status = 'recovered') AS total_recovered_revenue,
    AVG(total_amount) AS avg_cart_value,
    
    -- Recovery rate
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'recovered')::NUMERIC / COUNT(*) * 100), 2)
      ELSE 0 
    END AS recovery_rate_percent,
    
    -- Abandon rate (asumiendo visitas totales, aquí simplificado)
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*)::NUMERIC / (COUNT(*) + COUNT(*) FILTER (WHERE status = 'recovered')) * 100), 2)
      ELSE 0
    END AS abandon_rate_percent
    
  FROM abandoned_carts
  WHERE abandoned_at >= NOW() - INTERVAL '30 days'
),
email_stats AS (
  SELECT 
    COUNT(*) AS total_emails_sent,
    COUNT(*) FILTER (WHERE status = 'opened') AS total_opened,
    COUNT(*) FILTER (WHERE status = 'clicked') AS total_clicked,
    COUNT(*) FILTER (WHERE status = 'converted') AS total_converted,
    COUNT(*) FILTER (WHERE email_type = 'hour_1') AS emails_hour_1,
    COUNT(*) FILTER (WHERE email_type = 'hour_24') AS emails_hour_24,
    
    -- Open rate
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status IN ('opened', 'clicked', 'converted'))::NUMERIC / COUNT(*) * 100), 2)
      ELSE 0
    END AS open_rate_percent,
    
    -- Click rate
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status IN ('clicked', 'converted'))::NUMERIC / COUNT(*) * 100), 2)
      ELSE 0
    END AS click_rate_percent,
    
    -- Conversion rate
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'converted')::NUMERIC / COUNT(*) * 100), 2)
      ELSE 0
    END AS conversion_rate_percent
    
  FROM recovery_emails
  WHERE sent_at >= NOW() - INTERVAL '30 days'
),
coupon_stats AS (
  SELECT 
    COUNT(*) AS total_coupons_created,
    COUNT(*) FILTER (WHERE status = 'used') AS total_coupons_used,
    COUNT(*) FILTER (WHERE status = 'expired') AS total_coupons_expired,
    AVG(discount_value) AS avg_discount_value,
    
    -- Coupon usage rate
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'used')::NUMERIC / COUNT(*) * 100), 2)
      ELSE 0
    END AS coupon_usage_percent
    
  FROM recovery_coupons
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  rs.*,
  es.total_emails_sent,
  es.total_opened,
  es.total_clicked,
  es.total_converted,
  es.emails_hour_1,
  es.emails_hour_24,
  es.open_rate_percent,
  es.click_rate_percent,
  es.conversion_rate_percent,
  cs.total_coupons_created,
  cs.total_coupons_used,
  cs.total_coupons_expired,
  cs.avg_discount_value,
  cs.coupon_usage_percent
FROM recovery_stats rs
CROSS JOIN email_stats es
CROSS JOIN coupon_stats cs;

-- =====================================================
-- 8. VISTA DE TIMELINE DE RECUPERACIÓN
-- =====================================================

CREATE OR REPLACE VIEW recovery_timeline AS
SELECT 
  ac.id AS cart_id,
  ac.user_email,
  ac.total_amount,
  ac.status AS cart_status,
  ac.abandoned_at,
  ac.recovered_at,
  
  -- Time to recovery
  CASE 
    WHEN ac.recovered_at IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (ac.recovered_at - ac.abandoned_at)) / 3600
    ELSE NULL
  END AS hours_to_recovery,
  
  -- Emails sent
  (SELECT COUNT(*) FROM recovery_emails WHERE abandoned_cart_id = ac.id) AS emails_sent,
  (SELECT email_type FROM recovery_emails WHERE abandoned_cart_id = ac.id ORDER BY sent_at DESC LIMIT 1) AS last_email_type,
  
  -- Coupon used
  (SELECT code FROM recovery_coupons WHERE abandoned_cart_id = ac.id AND status = 'used' LIMIT 1) AS coupon_used,
  (SELECT discount_value FROM recovery_coupons WHERE abandoned_cart_id = ac.id AND status = 'used' LIMIT 1) AS discount_applied,
  
  ac.recovery_method
  
FROM abandoned_carts ac
WHERE ac.abandoned_at >= NOW() - INTERVAL '30 days'
ORDER BY ac.abandoned_at DESC;

-- =====================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden ver carritos abandonados
CREATE POLICY abandoned_carts_admin_select
ON abandoned_carts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = current_setting('app.user_id', true)::TEXT 
    AND users.role IN ('admin', 'ceo')
  )
);

-- Policy: Sistema puede insertar carritos
CREATE POLICY abandoned_carts_system_insert
ON abandoned_carts FOR INSERT
WITH CHECK (true);

-- Policy: Sistema puede actualizar carritos
CREATE POLICY abandoned_carts_system_update
ON abandoned_carts FOR UPDATE
USING (true);

-- Policy: Solo admins pueden ver emails
CREATE POLICY recovery_emails_admin_select
ON recovery_emails FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = current_setting('app.user_id', true)::TEXT 
    AND users.role IN ('admin', 'ceo')
  )
);

-- Policy: Sistema puede insertar emails
CREATE POLICY recovery_emails_system_insert
ON recovery_emails FOR INSERT
WITH CHECK (true);

-- Policy: Usuarios pueden ver sus propios cupones
CREATE POLICY recovery_coupons_user_select
ON recovery_coupons FOR SELECT
USING (
  used_by_email = current_setting('app.user_email', true)::TEXT
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = current_setting('app.user_id', true)::TEXT 
    AND users.role IN ('admin', 'ceo')
  )
);

-- Policy: Sistema puede insertar cupones
CREATE POLICY recovery_coupons_system_insert
ON recovery_coupons FOR INSERT
WITH CHECK (true);

-- Policy: Sistema puede actualizar cupones
CREATE POLICY recovery_coupons_system_update
ON recovery_coupons FOR UPDATE
USING (true);

-- =====================================================
-- 10. COMENTARIOS
-- =====================================================

COMMENT ON TABLE abandoned_carts IS 'Carritos abandonados durante checkout para sistema de recuperación.';
COMMENT ON TABLE recovery_emails IS 'Emails enviados para recuperar carritos abandonados con tracking completo.';
COMMENT ON TABLE recovery_coupons IS 'Cupones dinámicos generados para incentivar recuperación de carritos.';

COMMENT ON COLUMN abandoned_carts.cart_data IS 'JSONB con productos en carrito: { ebook: boolean, cv_audit: boolean, mentorship: boolean, prices: {...} }';
COMMENT ON COLUMN abandoned_carts.recovery_method IS 'Método que logró recuperar el carrito: email_1, email_2, manual, null si no recuperado.';
COMMENT ON COLUMN recovery_emails.magic_token IS 'Token único para magic link que pre-carga carrito y loguea usuario.';
COMMENT ON COLUMN recovery_coupons.valid_until IS 'Cupones expiran 12 horas después de ser creados.';

-- =====================================================
-- 11. ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

-- Índice compuesto para queries de cron job
CREATE INDEX idx_abandoned_carts_pending_old ON abandoned_carts(status, abandoned_at)
WHERE status = 'pending';

-- Índice para buscar carritos que necesitan email
CREATE INDEX idx_abandoned_carts_need_email ON abandoned_carts(abandoned_at, recovery_emails_sent)
WHERE status = 'pending';

-- Índice para magic links activos
CREATE INDEX idx_recovery_emails_active_links ON recovery_emails(magic_token, sent_at)
WHERE status NOT IN ('bounced', 'failed');
