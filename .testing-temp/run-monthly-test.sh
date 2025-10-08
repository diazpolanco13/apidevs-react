#!/bin/bash
# Script automatizado para testing de renovación mensual
# Ejecutar después de iniciar stripe listen y el servidor

set -e  # Salir si hay error

echo "🧪 =========================================="
echo "   TESTING RENOVACIÓN MENSUAL ($39/mes)"
echo "==========================================="
echo ""

# Price ID del plan mensual
PRICE_ID_MONTHLY="price_1SDYXpBUKmGwbE6IyejpKBSa"
USER_ID="71b7b58f-6c9d-4133-88e5-c69972dea205"

echo "📋 Paso 1: Crear Test Clock"
CLOCK_ID=$(stripe test_helpers test_clocks create \
  --frozen-time $(date +%s) \
  --name "Test Renovación Mensual" \
  | grep -o 'clock_[a-zA-Z0-9]*' | head -1)

if [ -z "$CLOCK_ID" ]; then
  echo "❌ Error: No se pudo crear el Test Clock"
  exit 1
fi

echo "✅ Clock ID: $CLOCK_ID"
echo ""

echo "📋 Paso 2: Crear Customer con Test Clock"
CUSTOMER_ID=$(stripe customers create \
  -d email="test-monthly@apidevs.io" \
  -d name="Test Monthly Renewal" \
  -d test_clock="$CLOCK_ID" \
  -d "metadata[user_id]=$USER_ID" \
  | grep -o 'cus_[a-zA-Z0-9]*' | head -1)

if [ -z "$CUSTOMER_ID" ]; then
  echo "❌ Error: No se pudo crear el Customer"
  exit 1
fi

echo "✅ Customer ID: $CUSTOMER_ID"
echo ""

echo "📋 Paso 3: Adjuntar método de pago"
stripe payment_methods attach pm_card_visa -d customer="$CUSTOMER_ID" > /dev/null 2>&1
echo "✅ Payment method attached"
echo ""

echo "📋 Paso 4: Crear Subscription MENSUAL ($39/mes)"
SUB_ID=$(stripe subscriptions create \
  -d customer="$CUSTOMER_ID" \
  -d "items[0][price]=$PRICE_ID_MONTHLY" \
  -d default_payment_method=pm_card_visa \
  | grep -o 'sub_[a-zA-Z0-9]*' | head -1)

if [ -z "$SUB_ID" ]; then
  echo "❌ Error: No se pudo crear la Subscription"
  exit 1
fi

echo "✅ Subscription ID: $SUB_ID"
echo ""

echo "⏳ Esperando 10 segundos para que se procese la primera invoice..."
sleep 10

echo ""
echo "📋 Paso 5: Avanzar Test Clock 31 días para simular renovación"
echo "⏩ Obteniendo tiempo actual del clock..."

CURRENT_TIME=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID" \
  --format json 2>/dev/null \
  | grep -o '"frozen_time": [0-9]*' \
  | grep -o '[0-9]*')

if [ -z "$CURRENT_TIME" ]; then
  echo "❌ Error: No se pudo obtener el frozen_time"
  exit 1
fi

NEW_TIME=$((CURRENT_TIME + 2678400))
echo "   Tiempo actual: $(date -d @$CURRENT_TIME '+%Y-%m-%d %H:%M:%S')"
echo "   Nuevo tiempo (+31 días): $(date -d @$NEW_TIME '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "⏩ Avanzando clock..."
stripe test_helpers test_clocks advance "$CLOCK_ID" --frozen-time $NEW_TIME > /dev/null 2>&1

echo "✅ Clock avanzado"
echo ""

echo "⏳ Esperando 20 segundos para que se procese la renovación..."
sleep 20

echo ""
echo "📊 Verificando estado del clock..."
stripe test_helpers test_clocks retrieve "$CLOCK_ID" | grep -E '"status":|"frozen_time":'

echo ""
echo "═══════════════════════════════════════════"
echo "✅ TESTING COMPLETADO"
echo "═══════════════════════════════════════════"
echo ""
echo "🔍 VERIFICACIÓN:"
echo ""
echo "1. Revisa los logs del servidor (Terminal 2)"
echo "   Debes ver: 🔄 RENOVACIÓN DETECTADA"
echo "   Con: Duración: 30D"
echo ""
echo "2. Ejecuta el script de verificación:"
echo "   npx tsx .testing-temp/verify-renewal-results.ts"
echo ""
echo "3. Revisa el dashboard:"
echo "   http://localhost:3000/admin/compras"
echo ""
echo "📝 IDs generados (guardar para limpieza):"
echo "   CLOCK_ID=$CLOCK_ID"
echo "   CUSTOMER_ID=$CUSTOMER_ID"
echo "   SUB_ID=$SUB_ID"
echo ""

