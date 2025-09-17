-- 🎯 QUERIES ESTRATÉGICAS PARA ANÁLISIS DE COMPRAS APIDevs

-- 1️⃣ HISTORIAL DE PAGOS POR CLIENTE
-- Ver todo lo que ha gastado un cliente específico
SELECT 
  p.order_number,
  p.order_date,
  p.product_name,
  p.order_total_cents / 100.0 as total_usd,
  p.payment_method,
  p.order_status,
  p.currency
FROM purchases p
JOIN legacy_users lu ON p.legacy_user_id = lu.id
WHERE lu.email = 'cliente@ejemplo.com'
ORDER BY p.order_date DESC;

-- 2️⃣ CLIENTES CON PRODUCTOS LIFETIME
-- Identificar todos los clientes VIP con compras de por vida
SELECT 
  lu.email,
  lu.full_name,
  lu.country,
  p.product_name,
  p.order_total_cents / 100.0 as total_pagado_usd,
  p.order_date as fecha_compra_lifetime
FROM legacy_users lu
JOIN purchases p ON lu.id = p.legacy_user_id
WHERE p.is_lifetime_purchase = true
ORDER BY p.order_date DESC;

-- 3️⃣ GASTO TOTAL POR CLIENTE
-- Ranking de clientes por valor total gastado
SELECT 
  lu.email,
  lu.full_name,
  lu.country,
  COUNT(p.id) as total_ordenes,
  SUM(p.order_total_cents) / 100.0 as total_gastado_usd,
  AVG(p.order_total_cents) / 100.0 as promedio_orden_usd,
  MIN(p.order_date) as primera_compra,
  MAX(p.order_date) as ultima_compra
FROM legacy_users lu
JOIN purchases p ON lu.id = p.legacy_user_id
WHERE p.order_status = 'completed'
GROUP BY lu.id, lu.email, lu.full_name, lu.country
ORDER BY total_gastado_usd DESC;

-- 4️⃣ MÉTRICAS DE INGRESOS POR FECHAS
-- Ingresos mensuales, semanales, diarios
SELECT 
  DATE_TRUNC('month', order_date) as mes,
  COUNT(*) as ordenes_completadas,
  SUM(order_total_cents) / 100.0 as ingresos_usd,
  AVG(order_total_cents) / 100.0 as ticket_promedio_usd,
  COUNT(CASE WHEN is_lifetime_purchase THEN 1 END) as ventas_lifetime
FROM purchases
WHERE order_status = 'completed'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY mes DESC;

-- Ingresos por año
SELECT 
  EXTRACT(year FROM order_date) as año,
  COUNT(*) as total_ordenes,
  SUM(order_total_cents) / 100.0 as ingresos_totales_usd,
  COUNT(DISTINCT customer_email) as clientes_unicos
FROM purchases
WHERE order_status = 'completed'
GROUP BY EXTRACT(year FROM order_date)
ORDER BY año DESC;

-- 5️⃣ ANÁLISIS POR MÉTODO DE PAGO
-- Distribución de pagos: Stripe vs PayPal vs Binance
SELECT 
  payment_method,
  COUNT(*) as total_transacciones,
  SUM(order_total_cents) / 100.0 as volumen_usd,
  AVG(order_total_cents) / 100.0 as ticket_promedio_usd,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM purchases WHERE order_status = 'completed'), 2) as porcentaje_transacciones,
  ROUND(SUM(order_total_cents) * 100.0 / (SELECT SUM(order_total_cents) FROM purchases WHERE order_status = 'completed'), 2) as porcentaje_ingresos
FROM purchases
WHERE order_status = 'completed'
GROUP BY payment_method
ORDER BY volumen_usd DESC;

-- 🔥 BONUS: TOP PRODUCTOS MÁS VENDIDOS
SELECT 
  product_name,
  product_category,
  COUNT(*) as unidades_vendidas,
  SUM(order_total_cents) / 100.0 as ingresos_producto_usd,
  AVG(order_total_cents) / 100.0 as precio_promedio_usd
FROM purchases
WHERE order_status = 'completed'
GROUP BY product_name, product_category
ORDER BY ingresos_producto_usd DESC;

-- 🌍 ANÁLISIS GEOGRÁFICO DE VENTAS
SELECT 
  billing_country,
  COUNT(*) as ordenes,
  COUNT(DISTINCT customer_email) as clientes_unicos,
  SUM(order_total_cents) / 100.0 as ingresos_pais_usd,
  AVG(order_total_cents) / 100.0 as ticket_promedio_pais_usd
FROM purchases
WHERE order_status = 'completed' AND billing_country IS NOT NULL
GROUP BY billing_country
ORDER BY ingresos_pais_usd DESC
LIMIT 20;
