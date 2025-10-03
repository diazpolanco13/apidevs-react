-- Agregar columnas de tier y estadísticas a legacy_users
-- Esto permitirá segmentar y filtrar legacy users por su historial de compras

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS customer_tier TEXT DEFAULT 'free' CHECK (customer_tier IN ('free', 'bronze', 'silver', 'gold', 'platinum', 'diamond'));

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS total_lifetime_spent NUMERIC(10,2) DEFAULT 0.00;

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS first_purchase_date TIMESTAMP;

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS last_purchase_date TIMESTAMP;

-- Crear índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_legacy_users_customer_tier ON legacy_users(customer_tier);
CREATE INDEX IF NOT EXISTS idx_legacy_users_total_spent ON legacy_users(total_lifetime_spent DESC);
CREATE INDEX IF NOT EXISTS idx_legacy_users_purchase_count ON legacy_users(purchase_count DESC);

-- Comentarios
COMMENT ON COLUMN legacy_users.customer_tier IS 'Nivel de lealtad calculado: diamond, platinum, gold, silver, bronze, free';
COMMENT ON COLUMN legacy_users.total_lifetime_spent IS 'Total gastado históricamente en WordPress (USD)';
COMMENT ON COLUMN legacy_users.purchase_count IS 'Número total de compras en WordPress';
COMMENT ON COLUMN legacy_users.first_purchase_date IS 'Fecha de primera compra en WordPress';
COMMENT ON COLUMN legacy_users.last_purchase_date IS 'Fecha de última compra en WordPress';

