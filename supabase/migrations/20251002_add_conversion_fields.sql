-- =====================================================
-- ADD CONVERSION FIELDS TO VISITOR_TRACKING
-- Fecha: 2 de Octubre 2025
-- Agregar campos faltantes para tracking de conversiones
-- =====================================================

-- Agregar campos faltantes para conversiones
ALTER TABLE visitor_tracking
ADD COLUMN IF NOT EXISTS product_purchased TEXT,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Comentarios en las nuevas columnas
COMMENT ON COLUMN visitor_tracking.product_purchased IS 'ID del producto comprado en la conversión';
COMMENT ON COLUMN visitor_tracking.subscription_id IS 'ID de la suscripción creada en Stripe';
COMMENT ON COLUMN visitor_tracking.user_id IS 'ID del usuario que realizó la compra';

-- Índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_product_purchased ON visitor_tracking(product_purchased);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_subscription_id ON visitor_tracking(subscription_id);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_user_id ON visitor_tracking(user_id);

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
