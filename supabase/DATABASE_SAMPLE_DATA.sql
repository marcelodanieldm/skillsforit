-- Datos de ejemplo para SkillsForIT (insertar después de crear el esquema)

-- Usuarios
INSERT INTO users (id, email, name, password, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'mentor@skillsforit.com', 'María García', '$2b$10$hashmentor', 'mentor'),
  ('00000000-0000-0000-0000-000000000002', 'user@example.com', 'Juan Pérez', '$2b$10$hashuser', 'mentee'),
  ('00000000-0000-0000-0000-000000000003', 'admin@skillsforit.com', 'Admin', '$2b$10$hashadmin', 'admin');

-- Mentores
INSERT INTO mentors (id, user_id, bio, specialties, status, accepting_students, max_students, current_students, rating, total_sessions)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Mentora experta en desarrollo profesional y frontend.', ARRAY['Frontend','React','Career Growth'], 'active', true, 10, 2, 5.0, 12);

-- Disponibilidad mentor
INSERT INTO mentor_availability (id, mentor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, '09:00', '12:00', 10, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 3, '15:00', '18:00', 10, true);

-- Wallet mentor
INSERT INTO mentor_wallets (id, mentor_id, balance, total_earned, sessions_completed)
VALUES ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 120.00, 300.00, 12);

-- Sesión de mentoría
INSERT INTO mentor_bookings (id, mentor_id, user_id, scheduled_at, duration, status, meeting_link, created_at)
VALUES ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', NOW() + INTERVAL '1 day', 10, 'scheduled', 'https://meet.skillsforit.com/40000000-0000-0000-0000-000000000001', NOW());

-- Nota de sesión
INSERT INTO mentorship_notes (id, session_id, action_items, private_mentor_notes, student_visible_feedback, progress_rating)
VALUES ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '["Preparar CV", "Practicar entrevista"]', 'Buen potencial, mejorar soft skills.', '¡Gran avance en la sesión!', 5);

-- Orden de compra
INSERT INTO orders (id, email, amount, currency, products, status)
VALUES ('60000000-0000-0000-0000-000000000001', 'user@example.com', 7.00, 'usd', '[{"type":"ebook","id":"ebook1"}]', 'completed');

-- Acceso a producto
INSERT INTO product_access (id, user_id, product_id, product_type, order_id, download_url)
VALUES ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'ebook1', 'ebook', '60000000-0000-0000-0000-000000000001', 'https://cdn.skillsforit.com/ebooks/ebook1.pdf');

-- Créditos de usuario
INSERT INTO user_assets (id, user_id, type, balance)
VALUES ('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'mentorship_credit', 4);

-- Suscripción de mentoría
INSERT INTO mentorship_subscriptions (id, user_id, status, sessions_total, sessions_left)
VALUES ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'active', 4, 4);

-- Evento de funnel
INSERT INTO funnel_events (id, event_type, session_id, email, data)
VALUES ('a0000000-0000-0000-0000-000000000001', 'checkout_completed', 'sess1', 'user@example.com', '{"source":"landing"}');
