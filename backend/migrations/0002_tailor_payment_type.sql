-- Add payment type and weekly rate to tailors
ALTER TABLE tailors ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'per_piece';
ALTER TABLE tailors ADD COLUMN pay_rate_per_week REAL NOT NULL DEFAULT 0;
