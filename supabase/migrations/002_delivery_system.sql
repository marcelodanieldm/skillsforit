-- Sprint 24: Database Schema para Sistema de Entrega
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- Tabla: product_access
-- Registra el acceso de usuarios a productos digitales
-- ============================================
CREATE TABLE IF NOT EXISTS product_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('ebook', 'cv_audit', 'mentorship')),
  order_id UUID REFERENCES orders(id),
  download_url TEXT,
  expires_at TIMESTAMP,
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoke_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_access_user ON product_access(user_id);
CREATE INDEX idx_product_access_order ON product_access(order_id);
CREATE INDEX idx_product_access_product ON product_access(product_id);
CREATE INDEX idx_product_access_expires ON product_access(expires_at);

-- ============================================
-- Tabla: user_assets
-- Gestiona créditos y recursos del usuario (ej: créditos de CV audit)
-- ============================================
CREATE TABLE IF NOT EXISTS user_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cv_audit_credit', 'mentorship_credit', 'other')),
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  order_id UUID REFERENCES orders(id),
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_assets_user ON user_assets(user_id);
CREATE INDEX idx_user_assets_type ON user_assets(user_id, type);
CREATE INDEX idx_user_assets_order ON user_assets(order_id);

-- ============================================
-- Tabla: mentorship_subscriptions
-- Gestiona suscripciones de mentoría
-- ============================================
CREATE TABLE IF NOT EXISTS mentorship_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  sessions_total INTEGER NOT NULL DEFAULT 4,
  sessions_used INTEGER NOT NULL DEFAULT 0 CHECK (sessions_used >= 0),
  sessions_left INTEGER NOT NULL DEFAULT 4 CHECK (sessions_left >= 0),
  starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mentorship_subs_user ON mentorship_subscriptions(user_id);
CREATE INDEX idx_mentorship_subs_status ON mentorship_subscriptions(status);
CREATE INDEX idx_mentorship_subs_expires ON mentorship_subscriptions(expires_at);
CREATE INDEX idx_mentorship_subs_order ON mentorship_subscriptions(order_id);

-- ============================================
-- Tabla: mentors (si no existe)
-- Lista de mentores disponibles
-- ============================================
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'busy')),
  accepting_students BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 10,
  current_students INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mentors_status ON mentors(status);
CREATE INDEX idx_mentors_accepting ON mentors(accepting_students);

-- ============================================
-- Actualizar tabla orders
-- Agregar campos para delivery tracking
-- ============================================
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS delivery_errors JSONB,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT,
  ADD COLUMN IF NOT EXISTS payment_error TEXT;

-- ============================================
-- Storage Bucket para productos
-- Crear bucket en Supabase Storage para almacenar PDFs
-- ============================================
-- Ejecutar en la consola de Supabase Storage:
-- 1. Crear bucket llamado "products"
-- 2. Configurar como PRIVATE (no público)
-- 3. Subir archivo: ebooks/guia-soft-skills-v1.pdf
-- 4. Configurar políticas de acceso:

-- Política: Usuarios pueden descargar si tienen acceso
CREATE POLICY "Users can download purchased products"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'products' 
  AND EXISTS (
    SELECT 1 FROM product_access
    WHERE product_access.user_id = auth.uid()::text
    AND product_access.download_url LIKE '%' || storage.objects.name || '%'
    AND product_access.revoked_at IS NULL
    AND (product_access.expires_at IS NULL OR product_access.expires_at > NOW())
  )
);

-- ============================================
-- Functions para automatizar lógica
-- ============================================

-- Función: Actualizar sessions_left automáticamente
CREATE OR REPLACE FUNCTION update_mentorship_sessions()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sessions_left := NEW.sessions_total - NEW.sessions_used;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mentorship_sessions
  BEFORE UPDATE ON mentorship_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_mentorship_sessions();

-- Función: Expirar suscripciones automáticamente
CREATE OR REPLACE FUNCTION expire_mentorship_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE mentorship_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Scheduled job para ejecutar cada día (configurar en Supabase Dashboard)
-- SELECT cron.schedule('expire-mentorships', '0 0 * * *', 'SELECT expire_mentorship_subscriptions()');

-- ============================================
-- Views útiles para reporting
-- ============================================

-- View: Productos entregados por usuario
CREATE OR REPLACE VIEW user_products_summary AS
SELECT 
  pa.user_id,
  COUNT(DISTINCT pa.product_id) as products_count,
  ARRAY_AGG(DISTINCT pa.product_type) as product_types,
  MAX(pa.granted_at) as last_purchase_date,
  SUM(CASE WHEN pa.revoked_at IS NULL THEN 1 ELSE 0 END) as active_products
FROM product_access pa
GROUP BY pa.user_id;

-- View: Estadísticas de mentoría
CREATE OR REPLACE VIEW mentorship_stats AS
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subs,
  SUM(sessions_used) as total_sessions_completed,
  AVG(sessions_used::DECIMAL / sessions_total) as avg_completion_rate,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subs
FROM mentorship_subscriptions;

-- View: Créditos de usuarios
CREATE OR REPLACE VIEW user_credits_summary AS
SELECT 
  user_id,
  type,
  balance,
  created_at
FROM user_assets
WHERE revoked_at IS NULL
  AND balance > 0;

-- ============================================
-- Sample data para testing
-- ============================================

-- Insertar mentores de ejemplo
INSERT INTO mentors (email, name, bio, specialties, status, accepting_students)
VALUES 
  ('mentor1@skillsforit.com', 'Carlos Rodríguez', 'Senior Software Engineer con 10+ años de experiencia', ARRAY['Backend', 'System Design', 'Career Growth'], 'active', true),
  ('mentor2@skillsforit.com', 'Ana Martínez', 'Tech Lead y experta en negociación salarial', ARRAY['Leadership', 'Salary Negotiation', 'Interview Prep'], 'active', true),
  ('mentor3@skillsforit.com', 'Luis García', 'Engineering Manager en FAANG', ARRAY['Career Strategy', 'Communication', 'Management'], 'active', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Verificación de instalación
-- ============================================

-- Query para verificar que todo esté instalado correctamente
SELECT 
  'product_access' as table_name,
  COUNT(*) as row_count
FROM product_access
UNION ALL
SELECT 
  'user_assets' as table_name,
  COUNT(*) as row_count
FROM user_assets
UNION ALL
SELECT 
  'mentorship_subscriptions' as table_name,
  COUNT(*) as row_count
FROM mentorship_subscriptions
UNION ALL
SELECT 
  'mentors' as table_name,
  COUNT(*) as row_count
FROM mentors;
