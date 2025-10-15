-- Migración para tabla de configuración del Asistente IA
-- Fecha: 2025-10-15
-- Descripción: Tabla para almacenar la configuración del chatbot con soporte multi-provider (OpenRouter/X.AI)

CREATE TABLE IF NOT EXISTS ai_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Modelo IA
  model_provider TEXT DEFAULT 'openrouter' CHECK (model_provider IN ('xai', 'openrouter')),
  model_name TEXT DEFAULT 'anthropic/claude-3.5-sonnet',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0.0 AND temperature <= 1.0),
  max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens >= 100 AND max_tokens <= 8000),

  -- System Prompt
  system_prompt TEXT,
  custom_greeting TEXT,

  -- Tools/Herramientas
  tools_enabled BOOLEAN DEFAULT true,
  available_tools JSONB DEFAULT '[]'::jsonb,

  -- Rate Limiting
  rate_limit_enabled BOOLEAN DEFAULT true,
  max_messages_per_minute INTEGER DEFAULT 10 CHECK (max_messages_per_minute >= 1 AND max_messages_per_minute <= 100),
  
  -- Respuestas
  response_style TEXT DEFAULT 'professional' CHECK (response_style IN ('professional', 'friendly', 'technical')),
  include_emojis BOOLEAN DEFAULT true,
  show_typing_indicator BOOLEAN DEFAULT true,

  -- Saludos
  greeting_type TEXT DEFAULT 'personalized' CHECK (greeting_type IN ('simple', 'personalized', 'detailed')),
  show_user_stats BOOLEAN DEFAULT true,
  show_legacy_discount BOOLEAN DEFAULT true,

  -- Avanzado
  stream_responses BOOLEAN DEFAULT true,
  enable_context_memory BOOLEAN DEFAULT false,
  max_conversation_history INTEGER DEFAULT 20 CHECK (max_conversation_history >= 5 AND max_conversation_history <= 100),
  
  -- Logging
  enable_logging BOOLEAN DEFAULT true,
  log_level TEXT DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),

  -- Meta
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ai_configuration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ai_configuration_updated_at
    BEFORE UPDATE ON ai_configuration
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_configuration_updated_at();

-- Políticas RLS
ALTER TABLE ai_configuration ENABLE ROW LEVEL SECURITY;

-- Solo admin puede leer y modificar la configuración
CREATE POLICY "Admin only access to ai_configuration" ON ai_configuration
    USING (auth.email() = 'api@apidevs.io');

-- Insertar configuración por defecto
INSERT INTO ai_configuration (
    model_provider,
    model_name,
    temperature,
    max_tokens,
    system_prompt,
    custom_greeting,
    tools_enabled,
    available_tools,
    response_style,
    greeting_type,
    is_active
) VALUES (
    'openrouter',
    'anthropic/claude-3.5-sonnet',
    0.7,
    2000,
    'Eres el asistente virtual de APIDevs Trading Platform. Ayudas con consultas sobre planes, indicadores, suscripciones y soporte técnico. Mantén un tono profesional pero amigable.',
    '¡Hola! 👋 Soy tu asistente de APIDevs. ¿En qué puedo ayudarte hoy?',
    true,
    '["getUserAccessDetails"]'::jsonb,
    'professional',
    'personalized',
    true
) ON CONFLICT DO NOTHING;
