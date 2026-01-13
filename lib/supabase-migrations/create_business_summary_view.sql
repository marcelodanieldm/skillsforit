-- Sprint 29: Vista SQL business_summary para optimización de queries
-- Centraliza todos los KPIs en un solo llamado API

-- 1. Crear función auxiliar para excluir pagos de prueba del CEO
CREATE OR REPLACE FUNCTION is_test_payment(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Excluir emails del CEO y cuentas de prueba
  RETURN user_email IN (
    'ceo@skillsforit.com',
    'test@skillsforit.com',
    'daniel@skillsforit.com' -- Ajustar según email real del CEO
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Vista principal: business_summary
CREATE OR REPLACE VIEW business_summary AS
WITH date_ranges AS (
  SELECT
    CURRENT_DATE AS today,
    CURRENT_DATE - INTERVAL '7 days' AS week_ago,
    CURRENT_DATE - INTERVAL '30 days' AS month_ago
),
-- Ingresos brutos (excluyendo pagos de prueba)
revenue_metrics AS (
  SELECT
    SUM(CASE WHEN p.created_at >= dr.today THEN p.amount / 100.0 ELSE 0 END) AS revenue_today,
    SUM(CASE WHEN p.created_at >= dr.week_ago THEN p.amount / 100.0 ELSE 0 END) AS revenue_week,
    SUM(CASE WHEN p.created_at >= dr.month_ago THEN p.amount / 100.0 ELSE 0 END) AS revenue_month,
    COUNT(CASE WHEN p.created_at >= dr.today THEN 1 END) AS transactions_today,
    COUNT(CASE WHEN p.created_at >= dr.week_ago THEN 1 END) AS transactions_week,
    COUNT(CASE WHEN p.created_at >= dr.month_ago THEN 1 END) AS transactions_month
  FROM payments p
  CROSS JOIN date_ranges dr
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE p.status = 'succeeded'
    AND NOT is_test_payment(pr.email)
),
-- Costos de OpenAI (excluyendo análisis de prueba)
openai_costs AS (
  SELECT
    SUM(CASE WHEN ca.created_at >= dr.today THEN (ca.tokens_used / 1000.0) * 0.002 ELSE 0 END) AS openai_cost_today,
    SUM(CASE WHEN ca.created_at >= dr.week_ago THEN (ca.tokens_used / 1000.0) * 0.002 ELSE 0 END) AS openai_cost_week,
    SUM(CASE WHEN ca.created_at >= dr.month_ago THEN (ca.tokens_used / 1000.0) * 0.002 ELSE 0 END) AS openai_cost_month
  FROM cv_audits ca
  CROSS JOIN date_ranges dr
  LEFT JOIN profiles pr ON ca.user_id = pr.id
  WHERE NOT is_test_payment(pr.email)
),
-- Comisiones de mentores (70% del booking)
mentor_costs AS (
  SELECT
    SUM(CASE WHEN mb.created_at >= dr.today THEN mb.amount * 0.7 ELSE 0 END) AS mentor_cost_today,
    SUM(CASE WHEN mb.created_at >= dr.week_ago THEN mb.amount * 0.7 ELSE 0 END) AS mentor_cost_week,
    SUM(CASE WHEN mb.created_at >= dr.month_ago THEN mb.amount * 0.7 ELSE 0 END) AS mentor_cost_month
  FROM mentor_bookings mb
  CROSS JOIN date_ranges dr
  LEFT JOIN profiles pr ON mb.user_id = pr.id
  WHERE mb.status = 'completed'
    AND NOT is_test_payment(pr.email)
),
-- Usuarios nuevos (excluyendo cuentas de prueba)
user_metrics AS (
  SELECT
    COUNT(CASE WHEN pr.created_at >= dr.today THEN 1 END) AS new_users_today,
    COUNT(CASE WHEN pr.created_at >= dr.week_ago THEN 1 END) AS new_users_week,
    COUNT(CASE WHEN pr.created_at >= dr.month_ago THEN 1 END) AS new_users_month
  FROM profiles pr
  CROSS JOIN date_ranges dr
  WHERE NOT is_test_payment(pr.email)
),
-- LTV por producto (promedio de ingresos por usuario)
ltv_metrics AS (
  SELECT
    COALESCE(AVG(CASE WHEN p.product_type = 'cv_audit' THEN p.amount / 100.0 END), 0) AS ltv_cv_audit,
    COALESCE(AVG(CASE WHEN p.product_type = 'mentorship' THEN p.amount / 100.0 END), 0) AS ltv_mentorship,
    COALESCE(AVG(CASE WHEN p.product_type = 'soft_skills_guide' THEN p.amount / 100.0 END), 0) AS ltv_soft_skills
  FROM payments p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE p.status = 'succeeded'
    AND NOT is_test_payment(pr.email)
),
-- Métricas de conversión por producto
conversion_metrics AS (
  SELECT
    COUNT(DISTINCT CASE WHEN p.product_type = 'cv_audit' THEN p.user_id END)::FLOAT / NULLIF(um.new_users_month, 0) * 100 AS conversion_cv_audit,
    COUNT(DISTINCT CASE WHEN p.product_type = 'mentorship' THEN p.user_id END)::FLOAT / NULLIF(um.new_users_month, 0) * 100 AS conversion_mentorship,
    COUNT(DISTINCT CASE WHEN p.product_type = 'soft_skills_guide' THEN p.user_id END)::FLOAT / NULLIF(um.new_users_month, 0) * 100 AS conversion_soft_skills
  FROM payments p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  CROSS JOIN user_metrics um
  WHERE p.status = 'succeeded'
    AND NOT is_test_payment(pr.email)
)
SELECT
  -- Revenue
  rm.revenue_today,
  rm.revenue_week,
  rm.revenue_month,
  rm.transactions_today,
  rm.transactions_week,
  rm.transactions_month,
  
  -- Costs
  oc.openai_cost_today + mc.mentor_cost_today AS total_costs_today,
  oc.openai_cost_week + mc.mentor_cost_week AS total_costs_week,
  oc.openai_cost_month + mc.mentor_cost_month AS total_costs_month,
  
  -- Net Margin
  (rm.revenue_today - (oc.openai_cost_today + mc.mentor_cost_today)) AS net_margin_today,
  (rm.revenue_week - (oc.openai_cost_week + mc.mentor_cost_week)) AS net_margin_week,
  (rm.revenue_month - (oc.openai_cost_month + mc.mentor_cost_month)) AS net_margin_month,
  
  -- Margin Percentage
  CASE WHEN rm.revenue_today > 0 THEN 
    ((rm.revenue_today - (oc.openai_cost_today + mc.mentor_cost_today)) / rm.revenue_today * 100)
  ELSE 0 END AS margin_percentage_today,
  CASE WHEN rm.revenue_week > 0 THEN 
    ((rm.revenue_week - (oc.openai_cost_week + mc.mentor_cost_week)) / rm.revenue_week * 100)
  ELSE 0 END AS margin_percentage_week,
  CASE WHEN rm.revenue_month > 0 THEN 
    ((rm.revenue_month - (oc.openai_cost_month + mc.mentor_cost_month)) / rm.revenue_month * 100)
  ELSE 0 END AS margin_percentage_month,
  
  -- CAC (asumiendo $7/día, $50/semana, $215/mes en marketing orgánico)
  CASE WHEN um.new_users_today > 0 THEN 7.0 / um.new_users_today ELSE 0 END AS cac_today,
  CASE WHEN um.new_users_week > 0 THEN 50.0 / um.new_users_week ELSE 0 END AS cac_week,
  CASE WHEN um.new_users_month > 0 THEN 215.0 / um.new_users_month ELSE 0 END AS cac_month,
  
  -- LTV
  (ltv.ltv_cv_audit + ltv.ltv_mentorship + ltv.ltv_soft_skills) AS ltv_total,
  ltv.ltv_cv_audit,
  ltv.ltv_mentorship,
  ltv.ltv_soft_skills,
  
  -- Conversion Rates
  cm.conversion_cv_audit,
  cm.conversion_mentorship,
  cm.conversion_soft_skills,
  
  -- Users
  um.new_users_today,
  um.new_users_week,
  um.new_users_month,
  
  -- Cost breakdown
  oc.openai_cost_today,
  oc.openai_cost_week,
  oc.openai_cost_month,
  mc.mentor_cost_today,
  mc.mentor_cost_week,
  mc.mentor_cost_month
FROM revenue_metrics rm
CROSS JOIN openai_costs oc
CROSS JOIN mentor_costs mc
CROSS JOIN user_metrics um
CROSS JOIN ltv_metrics ltv
CROSS JOIN conversion_metrics cm;

-- 3. Crear índices para mejorar performance de la vista
CREATE INDEX IF NOT EXISTS idx_payments_created_at_status 
  ON payments(created_at, status) 
  WHERE status = 'succeeded';

CREATE INDEX IF NOT EXISTS idx_cv_audits_created_at_user 
  ON cv_audits(created_at, user_id);

CREATE INDEX IF NOT EXISTS idx_mentor_bookings_created_at_status 
  ON mentor_bookings(created_at, status) 
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_profiles_created_at_email 
  ON profiles(created_at, email);

-- 4. Comentarios de documentación
COMMENT ON VIEW business_summary IS 'Vista optimizada para dashboard CEO - Sprint 29. Excluye pagos de prueba y centraliza todos los KPIs.';
COMMENT ON FUNCTION is_test_payment IS 'Filtra pagos de prueba del CEO para evitar sesgar métricas.';
