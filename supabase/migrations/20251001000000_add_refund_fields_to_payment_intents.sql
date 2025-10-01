-- Agregar campos de refund a payment_intents
-- Fecha: 1 de Octubre, 2025
-- Propósito: Trackear refunds en los payment intents

-- Agregar columnas de refund si no existen
DO $$ 
BEGIN
    -- Campo para indicar si el payment intent tiene refunds
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_intents' AND column_name='amount_refunded') THEN
        ALTER TABLE payment_intents 
        ADD COLUMN amount_refunded INTEGER DEFAULT 0;
    END IF;

    -- Campo para indicar si está completamente reembolsado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_intents' AND column_name='refunded') THEN
        ALTER TABLE payment_intents 
        ADD COLUMN refunded BOOLEAN DEFAULT FALSE;
    END IF;

    -- Campo para detalles de refunds (JSON)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_intents' AND column_name='refunds') THEN
        ALTER TABLE payment_intents 
        ADD COLUMN refunds JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Campo para fecha del último refund
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_intents' AND column_name='last_refund_at') THEN
        ALTER TABLE payment_intents 
        ADD COLUMN last_refund_at TIMESTAMPTZ;
    END IF;

    RAISE NOTICE 'Campos de refund agregados a payment_intents';
END $$;

-- Crear índices para mejorar queries de refunds
CREATE INDEX IF NOT EXISTS idx_payment_intents_refunded 
ON payment_intents(refunded) WHERE refunded = TRUE;

CREATE INDEX IF NOT EXISTS idx_payment_intents_amount_refunded 
ON payment_intents(amount_refunded) WHERE amount_refunded > 0;

-- Comentarios en las columnas
COMMENT ON COLUMN payment_intents.amount_refunded IS 'Monto total reembolsado en centavos';
COMMENT ON COLUMN payment_intents.refunded IS 'Indica si el payment intent está completamente reembolsado';
COMMENT ON COLUMN payment_intents.refunds IS 'Array JSON con detalles de todos los refunds asociados';
COMMENT ON COLUMN payment_intents.last_refund_at IS 'Fecha y hora del último refund procesado';

