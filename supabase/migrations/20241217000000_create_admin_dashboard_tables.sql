-- Migración para Dashboard Administrativo APIDevs
-- Crea las tablas necesarias para gestionar usuarios legacy y compras históricas

-- Tabla para usuarios legacy migrados desde WordPress
CREATE TABLE IF NOT EXISTS legacy_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    phone VARCHAR(50),
    postal_code VARCHAR(20),
    address TEXT,
    wordpress_username VARCHAR(100),
    billing_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migration_status VARCHAR(50) DEFAULT 'imported',
    reactivation_status VARCHAR(50) DEFAULT 'pending',
    reactivated_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para compras históricas migradas desde WordPress
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    customer_email VARCHAR(255) NOT NULL,
    order_total_cents INTEGER NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    revenue_valid_for_metrics BOOLEAN DEFAULT true,
    product_name VARCHAR(255),
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas del dashboard
CREATE INDEX IF NOT EXISTS idx_legacy_users_email ON legacy_users(email);
CREATE INDEX IF NOT EXISTS idx_legacy_users_reactivation_status ON legacy_users(reactivation_status);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_order_date ON purchases(order_date);
CREATE INDEX IF NOT EXISTS idx_purchases_revenue_valid ON purchases(revenue_valid_for_metrics);

-- Políticas RLS (Row Level Security)
ALTER TABLE legacy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (por ahora permitir lectura pública para desarrollo)
DROP POLICY IF EXISTS "Allow public read access to legacy_users" ON legacy_users;
CREATE POLICY "Allow public read access to legacy_users" ON legacy_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to purchases" ON purchases;
CREATE POLICY "Allow public read access to purchases" ON purchases FOR SELECT USING (true);

-- Insertar datos de prueba para verificar que el dashboard funciona
INSERT INTO legacy_users (email, full_name, country, city, reactivation_status) VALUES
('test1@example.com', 'Usuario Prueba 1', 'United States', 'Miami', 'pending'),
('test2@example.com', 'Usuario Prueba 2', 'Spain', 'Madrid', 'reactivated'),
('test3@example.com', 'Usuario Prueba 3', 'Mexico', 'Ciudad de México', 'pending')
ON CONFLICT (email) DO NOTHING;

INSERT INTO purchases (order_number, customer_email, order_total_cents, order_date, order_status, product_name) VALUES
('ORD-001', 'test1@example.com', 2350, NOW() - INTERVAL '1 day', 'completed', 'PRO Monthly Plan'),
('ORD-002', 'test2@example.com', 39000, NOW() - INTERVAL '2 days', 'completed', 'PRO Annual Plan'),
('ORD-003', 'test3@example.com', 99900, NOW() - INTERVAL '3 days', 'refunded', 'LIFETIME Plan')
ON CONFLICT (order_number) DO NOTHING;
