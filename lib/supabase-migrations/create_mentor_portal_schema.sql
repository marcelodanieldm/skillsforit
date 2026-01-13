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

-- Comentarios de documentaci\u00f3n
COMMENT ON TABLE mentor_wallets IS 'Billetera del mentor con saldo y pr\u00f3ximos pagos';
COMMENT ON TABLE mentor_transactions IS 'Historial de transacciones de cada mentor';
COMMENT ON TABLE mentor_payouts IS 'Solicitudes de pago de los mentores';
COMMENT ON COLUMN mentor_bookings.action_items IS 'Array de action items predefinidos seleccionados durante la sesi\u00f3n';
COMMENT ON COLUMN mentor_bookings.renewal_link_sent IS 'Flag para saber si se envi\u00f3 el link de renovaci\u00f3n en minuto 9';
