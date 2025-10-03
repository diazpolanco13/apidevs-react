-- Tabla de Indicadores de TradingView
CREATE TABLE IF NOT EXISTS public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación TradingView
  pine_id TEXT UNIQUE NOT NULL, -- PUB;asdnkasnda.....
  name TEXT NOT NULL,
  description TEXT,
  
  -- Clasificación
  category TEXT NOT NULL CHECK (category IN ('indicador', 'escaner', 'tools')),
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'desactivado', 'desarrollo')),
  type TEXT NOT NULL DEFAULT 'privado' CHECK (type IN ('privado', 'publico')),
  
  -- Imágenes (URLs de Supabase Storage o externas)
  image_1 TEXT,
  image_2 TEXT,
  image_3 TEXT,
  
  -- Metadata adicional
  features JSONB DEFAULT '[]'::jsonb, -- Array de características
  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- Tags para búsqueda
  
  -- Control
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Métricas de uso (opcional para futuro)
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_indicators_pine_id ON public.indicators(pine_id);
CREATE INDEX IF NOT EXISTS idx_indicators_category ON public.indicators(category);
CREATE INDEX IF NOT EXISTS idx_indicators_status ON public.indicators(status);
CREATE INDEX IF NOT EXISTS idx_indicators_type ON public.indicators(type);
CREATE INDEX IF NOT EXISTS idx_indicators_created_at ON public.indicators(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_indicators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_indicators_updated_at
  BEFORE UPDATE ON public.indicators
  FOR EACH ROW
  EXECUTE FUNCTION update_indicators_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer indicadores activos
CREATE POLICY "Indicadores activos son públicos"
  ON public.indicators
  FOR SELECT
  USING (status = 'activo');

-- Policy: Solo admins pueden insertar/actualizar/eliminar
CREATE POLICY "Solo admins pueden gestionar indicadores"
  ON public.indicators
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'api@apidevs.io'
  );

-- Comentarios para documentación
COMMENT ON TABLE public.indicators IS 'Catálogo de indicadores de TradingView gestionados por APIDevs';
COMMENT ON COLUMN public.indicators.pine_id IS 'ID público de TradingView (formato: PUB;xxxxx)';
COMMENT ON COLUMN public.indicators.category IS 'Categoría: indicador, escaner, tools';
COMMENT ON COLUMN public.indicators.status IS 'Estado: activo, desactivado, desarrollo';
COMMENT ON COLUMN public.indicators.type IS 'Tipo: privado (requiere suscripción) o publico (gratuito)';

