-- SkillsForIT - Esquema Normalizado de Base de Datos (PostgreSQL/Supabase)
-- Ejecuta este script en el SQL Editor de Supabase para crear la estructura principal

-- =====================
-- Tabla: users
-- =====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mentee','mentor','admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: mentors
-- =====================
CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  bio TEXT,
  specialties TEXT[],
  status TEXT DEFAULT 'active',
  accepting_students BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 10,
  current_students INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: mentor_availability
-- =====================
CREATE TABLE mentor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id),
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: mentor_wallets
-- =====================
CREATE TABLE mentor_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id),
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  sessions_completed INT DEFAULT 0,
  last_payout_date TIMESTAMP,
  next_payout_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: mentor_transactions
-- =====================
CREATE TABLE mentor_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id),
  type VARCHAR(50),
  amount DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: mentor_payouts
-- =====================
CREATE TABLE mentor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id),
  amount DECIMAL(10,2),
  bank_account VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP,
  processed_at TIMESTAMP
);

-- =====================
-- Tabla: mentor_bookings (sesiones)
-- =====================
CREATE TABLE mentor_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id),
  user_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMP NOT NULL,
  duration INT DEFAULT 10,
  status TEXT CHECK (status IN ('scheduled','completed','cancelled','no-show')),
  meeting_link TEXT,
  stripe_session_id TEXT,
  payment_status TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  actual_duration_minutes INT,
  mentor_notes TEXT,
  action_items TEXT[],
  renewal_link_sent BOOLEAN DEFAULT FALSE,
  renewal_sent_at TIMESTAMP,
  cancellation_reason TEXT,
  student_role VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: mentorship_notes
-- =====================
CREATE TABLE mentorship_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES mentor_bookings(id),
  action_items JSONB,
  private_mentor_notes TEXT,
  student_visible_feedback TEXT,
  progress_rating INT CHECK (progress_rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: orders
-- =====================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  products JSONB NOT NULL,
  session_id TEXT,
  order_bump_accepted BOOLEAN DEFAULT false,
  upsell_accepted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  delivered_at TIMESTAMP,
  delivery_errors JSONB,
  refunded_at TIMESTAMP,
  stripe_payment_status TEXT,
  payment_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: product_access
-- =====================
CREATE TABLE product_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('ebook','cv_audit','mentorship')),
  order_id UUID REFERENCES orders(id),
  download_url TEXT,
  expires_at TIMESTAMP,
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoke_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: user_assets
-- =====================
CREATE TABLE user_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('cv_audit_credit','mentorship_credit','other')),
  balance INTEGER NOT NULL DEFAULT 0,
  order_id UUID REFERENCES orders(id),
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: mentorship_subscriptions
-- =====================
CREATE TABLE mentorship_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  status TEXT DEFAULT 'active',
  sessions_total INTEGER DEFAULT 4,
  sessions_used INTEGER DEFAULT 0,
  sessions_left INTEGER DEFAULT 4,
  starts_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla: funnel_events
-- =====================
CREATE TABLE funnel_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  email TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Índices recomendados
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_mentors_user_id ON mentors(user_id);
CREATE INDEX idx_mentor_availability_mentor ON mentor_availability(mentor_id);
CREATE INDEX idx_mentor_bookings_mentor ON mentor_bookings(mentor_id);
CREATE INDEX idx_mentor_bookings_user ON mentor_bookings(user_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_product_access_user ON product_access(user_id);
CREATE INDEX idx_user_assets_user ON user_assets(user_id);
CREATE INDEX idx_mentorship_subs_user ON mentorship_subscriptions(user_id);
CREATE INDEX idx_funnel_events_session ON funnel_events(session_id);

-- =====================
-- Fin del esquema
