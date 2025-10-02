-- =====================================================
-- GEO-ANALYTICS DASHBOARD - MIGRATION
-- Fecha: 2 de Octubre 2025
-- Sistema de tracking geográfico y análisis de conversión
-- =====================================================

-- =====================================================
-- TABLA 1: visitor_tracking
-- Propósito: Registrar CADA visita a la web con información completa
-- =====================================================
CREATE TABLE IF NOT EXISTS visitor_tracking (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  fingerprint TEXT,
  
  -- Red
  ip_address INET,
  
  -- Geolocalización
  country TEXT, -- Código ISO (ES, MX, US)
  country_name TEXT, -- Nombre completo (España, México, USA)
  city TEXT,
  region TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  postal_code TEXT,
  
  -- Dispositivo
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  
  -- Origen del tráfico
  referer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Navegación
  landing_page TEXT,
  exit_page TEXT,
  pages_visited INTEGER DEFAULT 1,
  time_on_site INTEGER DEFAULT 0, -- segundos
  
  -- Conversión
  purchased BOOLEAN DEFAULT FALSE,
  purchase_id TEXT, -- FK a payment_intent de Stripe
  purchase_amount_cents INTEGER,
  product_purchased TEXT, -- ID del producto comprado
  subscription_id TEXT, -- ID de la suscripción creada
  user_id TEXT, -- ID del usuario que realizó la compra
  purchase_date TIMESTAMPTZ,
  
  -- Timestamps
  first_visit_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_country ON visitor_tracking(country);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_purchased ON visitor_tracking(purchased);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_utm_campaign ON visitor_tracking(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_created_at ON visitor_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_session_id ON visitor_tracking(session_id);

-- Índice compuesto para analytics de campañas
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_campaign_analytics 
ON visitor_tracking(utm_source, utm_campaign, country, purchased);

-- Índice para búsqueda por IP
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_ip ON visitor_tracking(ip_address);

-- =====================================================
-- TABLA 2: utm_campaigns
-- Propósito: Gestionar campañas publicitarias y sus metas
-- =====================================================
CREATE TABLE IF NOT EXISTS utm_campaigns (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  utm_source TEXT NOT NULL, -- facebook, google, instagram, tiktok
  utm_medium TEXT, -- cpc, email, social
  utm_campaign TEXT NOT NULL UNIQUE, -- slug único de la campaña
  
  -- Targeting
  target_countries TEXT[], -- Array de códigos ISO ["ES", "MX", "CO"]
  
  -- Budget
  budget_cents INTEGER, -- presupuesto en centavos
  status TEXT CHECK (status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  
  -- Metas
  reach_goal INTEGER, -- meta de alcance
  visits_goal INTEGER, -- meta de visitas
  purchases_goal INTEGER, -- meta de compras
  
  -- Datos externos (de Facebook/Google)
  external_reach INTEGER, -- reach real reportado por la plataforma
  external_impressions INTEGER,
  external_clicks INTEGER,
  external_spend_cents INTEGER, -- gasto real
  
  -- Metadata
  notes TEXT,
  created_by TEXT,
  start_date DATE,
  end_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para utm_campaigns
CREATE INDEX IF NOT EXISTS idx_utm_campaigns_status ON utm_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_utm_campaigns_utm_source ON utm_campaigns(utm_source);
CREATE INDEX IF NOT EXISTS idx_utm_campaigns_utm_campaign ON utm_campaigns(utm_campaign);

-- =====================================================
-- VISTA MATERIALIZADA 1: campaign_performance
-- Propósito: Pre-calcular métricas complejas de campañas
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_performance AS
SELECT 
  c.id as campaign_id,
  c.campaign_name,
  c.utm_source,
  c.utm_campaign,
  c.status,
  c.budget_cents,
  c.external_reach,
  c.external_spend_cents,
  
  -- Métricas calculadas del funnel
  COUNT(DISTINCT v.session_id) as total_visits,
  COUNT(DISTINCT v.session_id) FILTER (WHERE v.purchased = TRUE) as total_purchases,
  
  -- Tasas de conversión
  CASE 
    WHEN c.external_reach > 0 
    THEN (COUNT(DISTINCT v.session_id)::DECIMAL / c.external_reach * 100)
    ELSE 0 
  END as reach_to_visit_rate, -- CTR real
  
  CASE 
    WHEN COUNT(DISTINCT v.session_id) > 0 
    THEN (COUNT(DISTINCT v.session_id) FILTER (WHERE v.purchased = TRUE)::DECIMAL / COUNT(DISTINCT v.session_id) * 100)
    ELSE 0 
  END as visit_to_purchase_rate, -- Conversion rate
  
  -- Métricas financieras
  SUM(v.purchase_amount_cents) FILTER (WHERE v.purchased = TRUE) as total_revenue_cents,
  
  CASE 
    WHEN COUNT(DISTINCT v.session_id) FILTER (WHERE v.purchased = TRUE) > 0 
    THEN (c.external_spend_cents::DECIMAL / COUNT(DISTINCT v.session_id) FILTER (WHERE v.purchased = TRUE))
    ELSE 0 
  END as cac_cents, -- Customer Acquisition Cost
  
  CASE 
    WHEN c.external_spend_cents > 0 
    THEN (SUM(v.purchase_amount_cents) FILTER (WHERE v.purchased = TRUE)::DECIMAL / c.external_spend_cents)
    ELSE 0 
  END as roas, -- Return on Ad Spend
  
  -- Cobertura
  COUNT(DISTINCT v.country) as countries_reached,
  
  -- Timestamps
  MAX(v.created_at) as last_visit
FROM 
  utm_campaigns c
  LEFT JOIN visitor_tracking v ON v.utm_campaign = c.utm_campaign
GROUP BY 
  c.id, c.campaign_name, c.utm_source, c.utm_campaign, c.status, 
  c.budget_cents, c.external_reach, c.external_spend_cents;

-- Índice en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_performance_campaign_id 
ON campaign_performance(campaign_id);

-- =====================================================
-- VISTA MATERIALIZADA 2: country_stats
-- Propósito: Estadísticas agregadas por país
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS country_stats AS
SELECT 
  country,
  country_name,
  
  -- Volumen
  COUNT(DISTINCT session_id) as total_visits,
  COUNT(DISTINCT session_id) FILTER (WHERE purchased = TRUE) as total_purchases,
  
  -- Revenue
  SUM(purchase_amount_cents) FILTER (WHERE purchased = TRUE) as total_revenue_cents,
  
  -- Engagement
  CASE 
    WHEN COUNT(DISTINCT session_id) > 0 
    THEN (COUNT(DISTINCT session_id) FILTER (WHERE purchased = TRUE)::DECIMAL / COUNT(DISTINCT session_id) * 100)
    ELSE 0 
  END as conversion_rate,
  
  AVG(time_on_site) as avg_time_on_site,
  AVG(pages_visited) as avg_pages_visited,
  
  -- Dispositivos
  COUNT(DISTINCT session_id) FILTER (WHERE device_type = 'desktop') as desktop_visits,
  COUNT(DISTINCT session_id) FILTER (WHERE device_type = 'mobile') as mobile_visits,
  COUNT(DISTINCT session_id) FILTER (WHERE device_type = 'tablet') as tablet_visits,
  
  -- Geolocalización promedio (para el mapa)
  AVG(latitude) as avg_latitude,
  AVG(longitude) as avg_longitude,
  
  -- Frescura
  MAX(created_at) as last_visit
FROM 
  visitor_tracking
WHERE 
  country IS NOT NULL
GROUP BY 
  country, country_name;

-- Índice en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_country_stats_country 
ON country_stats(country);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para visitor_tracking
DROP TRIGGER IF EXISTS update_visitor_tracking_updated_at ON visitor_tracking;
CREATE TRIGGER update_visitor_tracking_updated_at
  BEFORE UPDATE ON visitor_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para utm_campaigns
DROP TRIGGER IF EXISTS update_utm_campaigns_updated_at ON utm_campaigns;
CREATE TRIGGER update_utm_campaigns_updated_at
  BEFORE UPDATE ON utm_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para refrescar vistas materializadas
CREATE OR REPLACE FUNCTION refresh_geo_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY country_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE visitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_campaigns ENABLE ROW LEVEL SECURITY;

-- Política para visitor_tracking: Solo admin puede leer
CREATE POLICY "Admin can read visitor_tracking" 
ON visitor_tracking FOR SELECT 
TO authenticated 
USING (auth.email() = 'api@apidevs.io');

-- Política para visitor_tracking: Servicio puede insertar/actualizar
CREATE POLICY "Service can insert visitor_tracking" 
ON visitor_tracking FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Service can update visitor_tracking" 
ON visitor_tracking FOR UPDATE 
TO service_role 
USING (true);

-- Política para utm_campaigns: Admin puede todo
CREATE POLICY "Admin can manage utm_campaigns" 
ON utm_campaigns FOR ALL 
TO authenticated 
USING (auth.email() = 'api@apidevs.io');

-- =====================================================
-- COMENTARIOS EN TABLAS (Documentación)
-- =====================================================

COMMENT ON TABLE visitor_tracking IS 'Tracking completo de visitantes con geolocalización y conversión';
COMMENT ON TABLE utm_campaigns IS 'Gestión de campañas publicitarias con métricas y metas';
COMMENT ON MATERIALIZED VIEW campaign_performance IS 'Métricas pre-calculadas de performance de campañas (CAC, ROAS, conversión)';
COMMENT ON MATERIALIZED VIEW country_stats IS 'Estadísticas agregadas por país para el mapa y analytics';

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL - Solo para desarrollo)
-- =====================================================

-- Insertar campaña de ejemplo
INSERT INTO utm_campaigns (
  campaign_name, 
  utm_source, 
  utm_campaign, 
  target_countries,
  budget_cents,
  status,
  external_reach,
  external_spend_cents,
  start_date
) VALUES (
  'Test Campaign España',
  'facebook',
  'test_spain_2025',
  ARRAY['ES'],
  50000, -- $500
  'active',
  10000,
  50000,
  CURRENT_DATE
) ON CONFLICT (utm_campaign) DO NOTHING;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

