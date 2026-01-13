-- Sprint 30: Schema para Portal de Mentores

-- Tabla: mentor_wallets (Billetera del mentor)
CREATE TABLE IF NOT EXISTS mentor_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  total_earned DECIMAL(10, 2) DEFAULT 0.00,
  sessions_completed INT DEFAULT 0,
  last_payout_date TIMESTAMP,
  next_payout_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: mentor_transactions (Historial de transacciones)
CREATE TABLE IF NOT EXISTS mentor_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'session_completed', 'payout_requested', 'payout_completed'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: mentor_payouts (Solicitudes de pago)
CREATE TABLE IF NOT EXISTS mentor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  bank_account VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  admin_notes TEXT
);

-- Actualizar tabla mentor_bookings con nuevos campos
ALTER TABLE mentor_bookings
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS actual_duration_minutes INT,
ADD COLUMN IF NOT EXISTS mentor_notes TEXT,
ADD COLUMN IF NOT EXISTS action_items TEXT[], -- Array de strings
ADD COLUMN IF NOT EXISTS renewal_link_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS renewal_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS student_role VARCHAR(255);

-- \u00cdndices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_mentor_scheduled 
  ON mentor_bookings(mentor_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_mentor_bookings_status_date 
  ON mentor_bookings(status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_mentor_wallets_mentor 
  ON mentor_wallets(mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_transactions_mentor_date 
  ON mentor_transactions(mentor_id, created_at DESC);

-- Tabla: mentor_availability (Disponibilidad de mentores)
CREATE TABLE IF NOT EXISTS mentor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Tabla: mentorship_notes (Notas de evolución del alumno)
CREATE TABLE IF NOT EXISTS mentorship_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES mentor_bookings(id) ON DELETE CASCADE,
  action_items JSONB, -- Lista de tareas estructuradas para el alumno
  private_mentor_notes TEXT, -- Notas privadas del mentor (no visibles para el alumno)
  student_visible_feedback TEXT, -- Feedback visible para el alumno
  progress_rating INT CHECK (progress_rating BETWEEN 1 AND 5), -- 1-5 stars
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices adicionales para disponibilidad y notas
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_day 
  ON mentor_availability(mentor_id, day_of_week, is_active);

CREATE INDEX IF NOT EXISTS idx_mentorship_notes_session 
  ON mentorship_notes(session_id);

-- Comentarios de documentación
COMMENT ON TABLE mentor_wallets IS 'Billetera del mentor con saldo y próximos pagos';
COMMENT ON TABLE mentor_transactions IS 'Historial de transacciones de cada mentor';
COMMENT ON TABLE mentor_payouts IS 'Solicitudes de pago de los mentores';
COMMENT ON TABLE mentor_availability IS 'Configuración de disponibilidad horaria de cada mentor';
COMMENT ON TABLE mentorship_notes IS 'Notas de evolución y seguimiento del progreso del alumno';
COMMENT ON COLUMN mentor_bookings.action_items IS 'Array de action items predefinidos seleccionados durante la sesión';
COMMENT ON COLUMN mentor_bookings.renewal_link_sent IS 'Flag para saber si se envió el link de renovación en minuto 9';
COMMENT ON COLUMN mentor_availability.day_of_week IS '0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado';
COMMENT ON COLUMN mentorship_notes.action_items IS 'JSONB con estructura flexible para action items con estado, prioridad, etc.';
COMMENT ON COLUMN mentorship_notes.private_mentor_notes IS 'Notas confidenciales del mentor, no expuestas al alumno';
