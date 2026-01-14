-- Sprint 39: Audio Feedback Lead Generation Tables
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columnas a tabla leads para audio feedback
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS role VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20), -- Junior, Mid, Senior, Staff
ADD COLUMN IF NOT EXISTS audio_feedback_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS audio_feedback_completed_at TIMESTAMP;

-- Index para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_leads_audio_feedback 
ON leads(audio_feedback_completed, audio_feedback_completed_at);

CREATE INDEX IF NOT EXISTS idx_leads_experience_level 
ON leads(experience_level);

CREATE INDEX IF NOT EXISTS idx_leads_country 
ON leads(country);

CREATE INDEX IF NOT EXISTS idx_leads_role 
ON leads(role);

-- 2. Tabla de análisis de audio feedback
CREATE TABLE IF NOT EXISTS audio_feedback_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Métricas de audio
  tone_score INTEGER, -- 0-100
  filler_words_count INTEGER,
  star_compliance INTEGER, -- 0-100
  
  -- Transcripciones
  transcriptions JSONB NOT NULL, -- Array de strings
  
  -- Segmentación
  experience_level VARCHAR(20), -- Junior, Mid, Senior, Staff
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audio_analyses_lead 
ON audio_feedback_analyses(lead_id);

CREATE INDEX IF NOT EXISTS idx_audio_analyses_session 
ON audio_feedback_analyses(session_id);

CREATE INDEX IF NOT EXISTS idx_audio_analyses_created 
ON audio_feedback_analyses(created_at);

CREATE INDEX IF NOT EXISTS idx_audio_analyses_experience 
ON audio_feedback_analyses(experience_level);

-- 3. RLS Policies (Row Level Security)
ALTER TABLE audio_feedback_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir insert desde backend
CREATE POLICY "Allow backend insert audio_feedback_analyses"
ON audio_feedback_analyses
FOR INSERT
WITH CHECK (true);

-- Policy: Permitir select desde backend
CREATE POLICY "Allow backend select audio_feedback_analyses"
ON audio_feedback_analyses
FOR SELECT
USING (true);

-- 4. Función para obtener stats rápidas
CREATE OR REPLACE FUNCTION get_audio_feedback_stats(period_days INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_leads', COUNT(*),
    'avg_tone_score', AVG(tone_score)::INTEGER,
    'avg_filler_words', AVG(filler_words_count)::INTEGER,
    'experience_distribution', json_build_object(
      'Junior', COUNT(*) FILTER (WHERE experience_level = 'Junior'),
      'Mid', COUNT(*) FILTER (WHERE experience_level = 'Mid'),
      'Senior', COUNT(*) FILTER (WHERE experience_level = 'Senior'),
      'Staff', COUNT(*) FILTER (WHERE experience_level = 'Staff')
    )
  )
  INTO result
  FROM audio_feedback_analyses
  WHERE created_at >= NOW() - (period_days || ' days')::INTERVAL;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Vista para CEO dashboard
CREATE OR REPLACE VIEW v_audio_feedback_dashboard AS
SELECT 
  DATE(a.created_at) as date,
  COUNT(DISTINCT a.lead_id) as leads_generated,
  AVG(a.tone_score)::INTEGER as avg_tone_score,
  AVG(a.filler_words_count)::INTEGER as avg_filler_words,
  a.experience_level,
  l.country,
  l.role
FROM audio_feedback_analyses a
JOIN leads l ON a.lead_id = l.id
WHERE a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(a.created_at), a.experience_level, l.country, l.role
ORDER BY date DESC;

-- 6. Agregar columna source a purchases para tracking
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS source VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_purchases_source 
ON purchases(source);

-- 7. Comentarios para documentación
COMMENT ON TABLE audio_feedback_analyses IS 'Sprint 39: Análisis de audio feedback de simulaciones comportamentales';
COMMENT ON COLUMN audio_feedback_analyses.tone_score IS 'Score de confianza en el tono (0-100)';
COMMENT ON COLUMN audio_feedback_analyses.filler_words_count IS 'Cantidad de muletillas detectadas';
COMMENT ON COLUMN audio_feedback_analyses.star_compliance IS 'Cumplimiento del método STAR (0-100)';

-- Verificar tablas creadas
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('audio_feedback_analyses', 'leads', 'purchases')
ORDER BY table_name, ordinal_position;
