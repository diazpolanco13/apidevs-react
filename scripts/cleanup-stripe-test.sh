#!/bin/bash
# cleanup-stripe-test.sh
# Script para limpiar recursos de prueba de Stripe (Test Clocks y recursos asociados)

echo "🧹 Limpiando recursos de prueba de Stripe..."
echo ""

# Verificar que Stripe CLI está instalado
if ! command -v stripe &> /dev/null; then
    echo "❌ Error: Stripe CLI no está instalado"
    echo "Instálalo desde: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Verificar que está autenticado
echo "🔐 Verificando autenticación..."
if ! stripe config --list &> /dev/null; then
    echo "❌ Error: No estás autenticado en Stripe CLI"
    echo "Ejecuta: stripe login"
    exit 1
fi

echo "✅ Autenticado correctamente"
echo ""

# Eliminar todos los test clocks
echo "📋 Obteniendo Test Clocks..."
CLOCKS=$(stripe test_helpers test_clocks list --format json 2>/dev/null | grep -o 'clock_[a-zA-Z0-9]*')

if [ -z "$CLOCKS" ]; then
  echo "✅ No hay Test Clocks para eliminar"
else
  CLOCK_COUNT=$(echo "$CLOCKS" | wc -l)
  echo "📊 Encontrados $CLOCK_COUNT Test Clock(s)"
  echo ""
  
  for CLOCK in $CLOCKS; do
    echo "🗑️  Eliminando $CLOCK..."
    if stripe test_helpers test_clocks delete "$CLOCK" 2>/dev/null; then
      echo "   ✅ Eliminado exitosamente"
    else
      echo "   ⚠️  Error al eliminar (puede que ya no exista)"
    fi
  done
  
  echo ""
  echo "✅ Test Clocks eliminados"
fi

echo ""
echo "📋 Recursos restantes:"
echo ""

# Mostrar resumen de recursos actuales
echo "Test Clocks activos:"
REMAINING_CLOCKS=$(stripe test_helpers test_clocks list 2>/dev/null | grep -c "clock_" || echo "0")
echo "   → $REMAINING_CLOCKS Test Clock(s)"

echo ""
echo "Customers activos:"
CUSTOMERS=$(stripe customers list --limit 100 2>/dev/null | grep -c "cus_" || echo "0")
echo "   → $CUSTOMERS Customer(s)"

echo ""
echo "Subscriptions activas:"
SUBS=$(stripe subscriptions list --limit 100 --status active 2>/dev/null | grep -c "sub_" || echo "0")
echo "   → $SUBS Subscription(s)"

echo ""
echo "✨ Limpieza completada"
echo ""
echo "💡 Nota: Eliminar Test Clocks automáticamente elimina customers,"
echo "   subscriptions e invoices asociadas."

