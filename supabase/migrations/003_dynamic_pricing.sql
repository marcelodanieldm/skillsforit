-- Sprint 26: Dynamic Pricing System
-- Tablas para gestión de precios y sincronización con Stripe

-- =====================================================
-- 1. TABLA DE SERVICIOS (Single Source of Truth)
-- =====================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stripe Integration
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Metadata
  type VARCHAR(50) NOT NULL, -- 'ebook', 'order_bump', 'upsell'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  last_updated_by TEXT, -- User ID del CEO que hizo el último cambio
  
  -- Configuración adicional
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para servicios
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_stripe_price_id ON services(stripe_price_id);

-- =====================================================
-- 2. TABLA DE HISTORIAL DE PRECIOS (price_log)
-- =====================================================

CREATE TABLE IF NOT EXISTS price_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con servicio
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Cambio de precio
  old_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  price_change_amount DECIMAL(10, 2) GENERATED ALWAYS AS (new_price - old_price) STORED,
  price_change_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN old_price > 0 THEN ((new_price - old_price) / old_price * 100)
      ELSE 0
    END
  ) STORED,
  
  -- Stripe
  old_stripe_price_id VARCHAR(255),
  new_stripe_price_id VARCHAR(255),
  
  -- Metadata del cambio
  changed_by VARCHAR(255) NOT NULL, -- Email o ID del usuario que hizo el cambio
  change_reason TEXT,
  
  -- Contexto de negocio
  expected_impact TEXT, -- Estimación del impacto en conversión
  actual_impact_tracked BOOLEAN DEFAULT false,
  
  -- Timestamps
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para historial
CREATE INDEX idx_price_log_service_id ON price_log(service_id);
CREATE INDEX idx_price_log_changed_at ON price_log(changed_at DESC);
CREATE INDEX idx_price_log_changed_by ON price_log(changed_by);

-- =====================================================
-- 3. FUNCIÓN DE TRIGGER PARA ACTUALIZAR TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_services_timestamp
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_services_timestamp();

-- =====================================================
-- 4. FUNCIÓN PARA REGISTRAR CAMBIOS DE PRECIO
-- =====================================================

CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si el precio cambió
  IF OLD.base_price != NEW.base_price THEN
    INSERT INTO price_log (
      service_id,
      old_price,
      new_price,
      old_stripe_price_id,
      new_stripe_price_id,
      changed_by,
      change_reason
    ) VALUES (
      NEW.id,
      OLD.base_price,
      NEW.base_price,
      OLD.stripe_price_id,
      NEW.stripe_price_id,
      COALESCE(current_setting('app.user_email', true), 'system'),
      COALESCE(current_setting('app.change_reason', true), 'Manual price update')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_price_change
AFTER UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION log_price_change();

-- =====================================================
-- 5. VISTA DE ANÁLISIS DE PRECIOS
-- =====================================================

CREATE OR REPLACE VIEW price_analytics AS
SELECT 
  s.id,
  s.name,
  s.slug,
  s.base_price AS current_price,
  s.currency,
  s.type,
  
  -- Estadísticas de cambios
  COUNT(ph.id) AS total_price_changes,
  AVG(ph.price_change_percentage) AS avg_price_change_pct,
  MIN(ph.new_price) AS lowest_price_ever,
  MAX(ph.new_price) AS highest_price_ever,
  
  -- Último cambio
  MAX(ph.changed_at) AS last_price_change_at,
  
  -- Rango de fechas
  MIN(ph.changed_at) AS first_price_change_at
  
FROM services s
LEFT JOIN price_log ph ON s.id = ph.service_id
GROUP BY s.id, s.name, s.slug, s.base_price, s.currency, s.type;

-- =====================================================
-- 6. VISTA DE HISTORIAL DE PRECIOS CON DETALLES
-- =====================================================

CREATE OR REPLACE VIEW price_log_detailed AS
SELECT 
  ph.id,
  ph.service_id,
  s.name AS service_name,
  s.slug AS service_slug,
  s.type AS service_type,
  ph.old_price,
  ph.new_price,
  ph.price_change_amount,
  ph.price_change_percentage,
  ph.changed_by,
  ph.change_reason,
  ph.changed_at,
  
  -- Contexto adicional
  CASE 
    WHEN ph.price_change_percentage > 0 THEN 'increase'
    WHEN ph.price_change_percentage < 0 THEN 'decrease'
    ELSE 'no_change'
  END AS change_direction,
  
  CASE 
    WHEN ABS(ph.price_change_percentage) >= 20 THEN 'major'
    WHEN ABS(ph.price_change_percentage) >= 10 THEN 'moderate'
    ELSE 'minor'
  END AS change_magnitude

FROM price_log ph
JOIN services s ON ph.service_id = s.id
ORDER BY ph.changed_at DESC;

-- =====================================================
-- 7. DATOS INICIALES (SEED)
-- =====================================================

-- Insertar servicios iniciales basados en Sprint 24
INSERT INTO services (name, slug, description, base_price, type, display_order, metadata) VALUES
  (
    'Guía de Soft Skills para IT Professionals',
    'soft-skills-guide',
    'E-book completo con estrategias probadas para mejorar tus habilidades interpersonales en el sector tecnológico',
    10.00,
    'ebook',
    1,
    '{"pages": 120, "format": "PDF", "delivery": "immediate"}'
  ),
  (
    'Auditoría de CV con IA',
    'cv-audit-ai',
    'Análisis profesional de tu currículum con recomendaciones específicas para el sector tech',
    7.00,
    'order_bump',
    2,
    '{"credits": 1, "analysis_time": "instant", "report_format": "PDF"}'
  ),
  (
    'Mentoría 1:1 (1 Mes)',
    'mentorship-1-month',
    '4 sesiones personalizadas de 60 minutos con un mentor senior del sector tecnológico',
    25.00,
    'upsell',
    3,
    '{"sessions": 4, "duration_minutes": 60, "validity_days": 30, "booking": "flexible"}'
  )
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 8. POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_log ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer servicios activos
CREATE POLICY "Anyone can view active services"
ON services FOR SELECT
USING (is_active = true);

-- Política: Solo admins pueden modificar servicios
-- (Se implementará con autenticación específica)
CREATE POLICY "Admins can manage services"
ON services FOR ALL
USING (
  -- Por ahora permitimos todo, luego se restringe con auth
  true
);

-- Política: Solo admins pueden ver historial de precios
CREATE POLICY "Admins can view price history"
ON price_log FOR SELECT
USING (true);

-- =====================================================
-- 9. FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener el precio actual de un servicio por slug
CREATE OR REPLACE FUNCTION get_service_price(service_slug VARCHAR)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  service_price DECIMAL(10, 2);
BEGIN
  SELECT base_price INTO service_price
  FROM services
  WHERE slug = service_slug AND is_active = true;
  
  RETURN service_price;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener todos los servicios activos
CREATE OR REPLACE FUNCTION get_active_services()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  base_price DECIMAL(10, 2),
  currency VARCHAR,
  type VARCHAR,
  stripe_price_id VARCHAR,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.name, s.slug, s.description,
    s.base_price, s.currency, s.type,
    s.stripe_price_id, s.metadata
  FROM services s
  WHERE s.is_active = true
  ORDER BY s.display_order;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE services IS 'Single Source of Truth para precios de servicios. Se sincroniza con Stripe.';
COMMENT ON TABLE price_log IS 'Historial completo de cambios de precio para análisis y auditoría.';
COMMENT ON COLUMN services.stripe_price_id IS 'ID del precio en Stripe. Se actualiza automáticamente al cambiar base_price.';
COMMENT ON COLUMN price_log.changed_by IS 'Email del usuario CEO que realizó el cambio.';
COMMENT ON COLUMN price_log.expected_impact IS 'Estimación del impacto en conversión basada en data histórica.';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
