-- ============================================================
-- TABLA: user_activity_log
-- Descripción: Registra toda la actividad del usuario en la aplicación
-- Autor: Sistema de tracking
-- Fecha: 1 de octubre de 2025
-- ============================================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del evento
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'button_click', 'login', 'logout', 'checkout_start', etc.
  event_category VARCHAR(50) NOT NULL, -- 'navigation', 'auth', 'commerce', 'interaction'
  event_action VARCHAR(255) NOT NULL, -- Descripción del evento
  event_label VARCHAR(255), -- Etiqueta adicional
  
  -- Contexto de la página
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  referrer TEXT,
  
  -- Información del dispositivo/navegador
  user_agent TEXT,
  ip_address INET,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- Ubicación geográfica (opcional)
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Datos adicionales (JSON flexible)
  metadata JSONB DEFAULT '{}',
  
  -- Session tracking
  session_id UUID,
  session_duration INTEGER, -- Duración en segundos
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para búsquedas rápidas
  CONSTRAINT user_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_event_type ON user_activity_log(event_type);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX idx_user_activity_log_session_id ON user_activity_log(session_id);
CREATE INDEX idx_user_activity_log_user_created ON user_activity_log(user_id, created_at DESC);

-- Índice GIN para búsquedas rápidas en metadata
CREATE INDEX idx_user_activity_log_metadata ON user_activity_log USING GIN (metadata);

-- RLS (Row Level Security)
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Los usuarios solo pueden ver su propia actividad
CREATE POLICY "Users can view own activity"
  ON user_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar su propia actividad
CREATE POLICY "Users can insert own activity"
  ON user_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los admins pueden ver toda la actividad (usando service_role)
-- No necesitamos política especial, usaremos supabaseAdmin

-- Comentarios
COMMENT ON TABLE user_activity_log IS 'Registro completo de actividad del usuario para analytics y auditoría';
COMMENT ON COLUMN user_activity_log.event_type IS 'Tipo de evento: page_view, click, login, logout, etc.';
COMMENT ON COLUMN user_activity_log.event_category IS 'Categoría del evento: navigation, auth, commerce, interaction';
COMMENT ON COLUMN user_activity_log.metadata IS 'Datos adicionales en formato JSON flexible';
COMMENT ON COLUMN user_activity_log.session_id IS 'ID de sesión para agrupar eventos relacionados';

