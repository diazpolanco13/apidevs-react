-- Add tradingview_url column to indicators table
ALTER TABLE indicators 
ADD COLUMN tradingview_url TEXT;

-- Add comment
COMMENT ON COLUMN indicators.tradingview_url IS 'URL completa del indicador en TradingView para acceso rápido al código';

