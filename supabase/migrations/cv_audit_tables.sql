-- CV Audit System Tables

-- Store temporary CV analyses (24 hour expiry)
CREATE TABLE IF NOT EXISTS cv_analyses (
  id TEXT PRIMARY KEY,
  cv_text TEXT NOT NULL,
  profession TEXT NOT NULL,
  country TEXT NOT NULL,
  full_analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Store CV audit payments
CREATE TABLE IF NOT EXISTS cv_audit_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cv_analyses_expires_at ON cv_analyses(expires_at);
CREATE INDEX IF NOT EXISTS idx_cv_audit_payments_user_id ON cv_audit_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_audit_payments_analysis_id ON cv_audit_payments(analysis_id);
CREATE INDEX IF NOT EXISTS idx_cv_audit_payments_stripe_id ON cv_audit_payments(stripe_payment_intent_id);

-- Clean up expired analyses (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cv_analyses()
RETURNS void AS $$
BEGIN
  DELETE FROM cv_analyses WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;