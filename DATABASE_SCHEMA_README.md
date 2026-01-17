# SkillsForIT - Esquema Normalizado de Base de Datos

Este documento describe el modelo de datos relacional para SkillsForIT, orientado a PostgreSQL/Supabase. Incluye las tablas principales, relaciones y justificación de diseño.

## Diagrama Entidad-Relación (ER)

- **users** (usuarios de la plataforma)
- **mentors** (perfil extendido de mentor)
- **mentor_availability** (disponibilidad semanal de mentores)
- **mentor_wallets** (saldo y pagos de mentores)
- **mentor_transactions** (movimientos de saldo mentor)
- **mentor_payouts** (retiros de mentores)
- **mentor_bookings** (sesiones reservadas)
- **mentorship_notes** (notas y feedback de sesiones)
- **orders** (órdenes de compra)
- **product_access** (acceso a productos digitales)
- **user_assets** (créditos y recursos del usuario)
- **mentorship_subscriptions** (suscripciones de mentoría)
- **funnel_events** (eventos de conversión)

## Tablas y Campos

### users
- id UUID PRIMARY KEY
- email TEXT UNIQUE NOT NULL
- name TEXT NOT NULL
- password TEXT NOT NULL
- role TEXT CHECK (role IN ('mentee','mentor','admin'))
- created_at TIMESTAMP DEFAULT NOW()

### mentors
- id UUID PRIMARY KEY
- user_id UUID REFERENCES users(id)
- bio TEXT
- specialties TEXT[]
- status TEXT DEFAULT 'active'
- accepting_students BOOLEAN DEFAULT true
- max_students INTEGER DEFAULT 10
- current_students INTEGER DEFAULT 0
- rating DECIMAL(3,2) DEFAULT 5.0
- total_sessions INTEGER DEFAULT 0
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()

### mentor_availability
- id UUID PRIMARY KEY
- mentor_id UUID REFERENCES mentors(id)
- day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6)
- start_time TIME NOT NULL
- end_time TIME NOT NULL
- slot_duration_minutes INT DEFAULT 10
- is_active BOOLEAN DEFAULT TRUE
- created_at TIMESTAMP DEFAULT NOW()

### mentor_wallets
- id UUID PRIMARY KEY
- mentor_id UUID REFERENCES mentors(id)
- balance DECIMAL(10,2) DEFAULT 0.00
- total_earned DECIMAL(10,2) DEFAULT 0.00
- sessions_completed INT DEFAULT 0
- last_payout_date TIMESTAMP
- next_payout_date TIMESTAMP
- created_at TIMESTAMP DEFAULT NOW()

### mentor_transactions
- id UUID PRIMARY KEY
- mentor_id UUID REFERENCES mentors(id)
- type VARCHAR(50)
- amount DECIMAL(10,2)
- description TEXT
- created_at TIMESTAMP DEFAULT NOW()

### mentor_payouts
- id UUID PRIMARY KEY
- mentor_id UUID REFERENCES mentors(id)
- amount DECIMAL(10,2)
- bank_account VARCHAR(255)
- status VARCHAR(50) DEFAULT 'pending'
- requested_at TIMESTAMP
- processed_at TIMESTAMP

### mentor_bookings
- id UUID PRIMARY KEY
- mentor_id UUID REFERENCES mentors(id)
- user_id UUID REFERENCES users(id)
- scheduled_at TIMESTAMP NOT NULL
- duration INT DEFAULT 10
- status TEXT CHECK (status IN ('scheduled','completed','cancelled','no-show'))
- meeting_link TEXT
- stripe_session_id TEXT
- payment_status TEXT
- started_at TIMESTAMP
- completed_at TIMESTAMP
- actual_duration_minutes INT
- mentor_notes TEXT
- action_items TEXT[]
- renewal_link_sent BOOLEAN DEFAULT FALSE
- renewal_sent_at TIMESTAMP
- cancellation_reason TEXT
- student_role VARCHAR(255)
- created_at TIMESTAMP DEFAULT NOW()

### mentorship_notes
- id UUID PRIMARY KEY
- session_id UUID REFERENCES mentor_bookings(id)
- action_items JSONB
- private_mentor_notes TEXT
- student_visible_feedback TEXT
- progress_rating INT CHECK (progress_rating BETWEEN 1 AND 5)
- created_at TIMESTAMP DEFAULT NOW()

### orders
- id UUID PRIMARY KEY
- email TEXT NOT NULL
- stripe_payment_intent_id TEXT UNIQUE
- amount DECIMAL(10,2) NOT NULL
- currency TEXT DEFAULT 'usd'
- products JSONB NOT NULL
- session_id TEXT
- order_bump_accepted BOOLEAN DEFAULT false
- upsell_accepted BOOLEAN DEFAULT false
- status TEXT DEFAULT 'pending'
- metadata JSONB
- delivered_at TIMESTAMP
- delivery_errors JSONB
- refunded_at TIMESTAMP
- stripe_payment_status TEXT
- payment_error TEXT
- created_at TIMESTAMP DEFAULT NOW()

### product_access
- id UUID PRIMARY KEY
- user_id TEXT NOT NULL
- product_id TEXT NOT NULL
- product_type TEXT CHECK (product_type IN ('ebook','cv_audit','mentorship'))
- order_id UUID REFERENCES orders(id)
- download_url TEXT
- expires_at TIMESTAMP
- granted_at TIMESTAMP DEFAULT NOW()
- revoked_at TIMESTAMP
- revoke_reason TEXT
- created_at TIMESTAMP DEFAULT NOW()

### user_assets
- id UUID PRIMARY KEY
- user_id TEXT NOT NULL
- type TEXT CHECK (type IN ('cv_audit_credit','mentorship_credit','other'))
- balance INTEGER NOT NULL DEFAULT 0
- order_id UUID REFERENCES orders(id)
- revoked_at TIMESTAMP
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()

### mentorship_subscriptions
- id UUID PRIMARY KEY
- user_id TEXT NOT NULL
- order_id UUID REFERENCES orders(id)
- status TEXT DEFAULT 'active'
- sessions_total INTEGER DEFAULT 4
- sessions_used INTEGER DEFAULT 0
- sessions_left INTEGER DEFAULT 4
- starts_at TIMESTAMP DEFAULT NOW()
- expires_at TIMESTAMP
- cancelled_at TIMESTAMP
- cancellation_reason TEXT
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()

### funnel_events
- id UUID PRIMARY KEY
- event_type TEXT NOT NULL
- session_id TEXT NOT NULL
- email TEXT
- data JSONB
- created_at TIMESTAMP DEFAULT NOW()

## Relaciones Clave
- Un usuario puede ser mentor (users.id = mentors.user_id)
- Un mentor tiene muchas disponibilidades (mentors.id = mentor_availability.mentor_id)
- Un mentor tiene muchas sesiones (mentors.id = mentor_bookings.mentor_id)
- Un usuario puede reservar muchas sesiones (users.id = mentor_bookings.user_id)
- Una sesión puede tener muchas notas (mentor_bookings.id = mentorship_notes.session_id)
- Un mentor tiene un wallet (mentors.id = mentor_wallets.mentor_id)
- Un wallet tiene muchas transacciones y payouts
- Un usuario puede tener muchos assets y subscriptions
- Una orden puede dar acceso a productos y créditos

## Notas de Normalización
- Todas las claves foráneas referencian UUIDs.
- No se almacena información redundante (por ejemplo, el email del usuario sólo en users, no en bookings).
- Los arrays y JSONB se usan sólo para campos que requieren flexibilidad (ej: action_items, products).
- Se recomienda usar índices en campos de búsqueda frecuente (email, mentor_id, user_id, status).

---

Este esquema está listo para implementarse en Supabase/PostgreSQL. Puedes adaptar los nombres de tablas/campos según tus necesidades específicas.