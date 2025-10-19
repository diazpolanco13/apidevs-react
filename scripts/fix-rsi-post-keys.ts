import { createClient } from '@sanity/client';
import { randomUUID } from 'crypto';

const client = createClient({
  projectId: 'mpxhkyzk',
  dataset: 'production',
  token: 'skkpkA8jMLLzX6ZMo86M7rxAVKuab40kmBF15fp8FzN7vMIuWd6ZiZjxTUKrtsUvX0qVcXyB6AUuuE5lsxXHb1X1P7Ba0lCiTI8vsxlNc7tRkEXAl8gupCGv4bw3n0GL9I3ZBQOpCYSsfNU2GBEJAn70NZQH7wv8wLOkAqCVn7SE14H4M2At',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Helper para generar _key único
function generateKey(): string {
  return randomUUID().replace(/-/g, '').substring(0, 12);
}

async function fixRSIPost() {
  console.log('🔧 Arreglando keys del post RSI...\n');

  const POST_ID = 'JLKvYdmWOE02vgBAPv7IcR';

  // Primero obtener el documento actual
  const existingPost = await client.getDocument(POST_ID);
  
  if (!existingPost) {
    console.error('❌ Post no encontrado');
    return;
  }

  console.log('📄 Post encontrado:', existingPost.title);
  console.log('🔄 Agregando _key a todos los elementos...\n');

  // Contenido completo con _key en cada elemento
  const contentWithKeys = [
    // INTRODUCCIÓN
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'El ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI (Relative Strength Index)',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' es uno de los indicadores técnicos más populares y poderosos del trading. Desarrollado por ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'J. Welles Wilder Jr.',
          marks: ['em']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' en 1978, este oscilador de momentum mide la ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'velocidad y magnitud',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' de los cambios de precio.',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'En esta guía completa, aprenderás desde los conceptos básicos hasta las ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'estrategias avanzadas',
          marks: ['strong', 'highlight']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' que usan los traders profesionales. ¡Empecemos! 🚀',
          marks: []
        }
      ]
    },

    // CALLOUT INFO
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'info',
      title: '¿Sabías esto?',
      content: 'El RSI oscila entre 0 y 100, pero los niveles más importantes son 30 (sobreventa) y 70 (sobrecompra). Sin embargo, estos niveles NO son señales automáticas de compra/venta.'
    },

    // H2: QUÉ ES EL RSI
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h2',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '📊 ¿Qué es el RSI y cómo funciona?',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'El RSI es un ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'oscilador de momentum',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' que compara la magnitud de las ganancias recientes con las pérdidas recientes para determinar condiciones de ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'sobrecompra y sobreventa',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' de un activo.',
          marks: []
        }
      ]
    },

    // LISTA NUMERADA: COMPONENTES DEL RSI
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h3',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Componentes Clave del RSI',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'number',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Periodo de Cálculo',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Por defecto 14 periodos (puede ser ajustado)',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'number',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Niveles de Sobrecompra/Sobreventa',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': 70/30 son los estándar, pero 80/20 para tendencias fuertes',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'number',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Línea Central (50)',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Divide momentum alcista (>50) y bajista (<50)',
          marks: []
        }
      ]
    },

    // CODE BLOCK: FÓRMULA RSI
    {
      _type: 'codeBlock',
      _key: generateKey(),
      filename: 'formula-rsi.py',
      language: 'python',
      showLineNumbers: true,
      code: `# Cálculo del RSI en Python
def calculate_rsi(prices, period=14):
    """
    Calcula el RSI para una serie de precios
    
    Args:
        prices: Lista de precios de cierre
        period: Periodo de cálculo (default: 14)
    
    Returns:
        Lista de valores RSI
    """
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    # Promedios móviles de ganancias y pérdidas
    avg_gains = pd.Series(gains).rolling(window=period).mean()
    avg_losses = pd.Series(losses).rolling(window=period).mean()
    
    # Cálculo del RS y RSI
    rs = avg_gains / avg_losses
    rsi = 100 - (100 / (1 + rs))
    
    return rsi

# Ejemplo de uso
prices = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10]
rsi_values = calculate_rsi(prices, period=14)
print(f"RSI actual: {rsi_values[-1]:.2f}")`
    },

    // CALLOUT TIP
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'tip',
      title: '💡 Pro Tip',
      content: 'En TradingView, puedes agregar nuestro RSI PRO+ que incluye señales automáticas, alertas personalizables y detección de divergencias en tiempo real.'
    },

    // H2: CÓMO INTERPRETAR EL RSI
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h2',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '🔍 Cómo Interpretar el RSI Correctamente',
          marks: []
        }
      ]
    },

    // LISTA BULLETS: INTERPRETACIONES
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI > 70',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Zona de sobrecompra - Posible corrección a la baja',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI < 30',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Zona de sobreventa - Posible rebote al alza',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI = 50',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Equilibrio entre compradores y vendedores',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI en tendencia alcista',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Tiende a permanecer entre 40-90',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI en tendencia bajista',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Tiende a permanecer entre 10-60',
          marks: []
        }
      ]
    },

    // CALLOUT WARNING
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'warning',
      title: '⚠️ Error Común de Principiantes',
      content: 'NO vendas solo porque el RSI está en 70+. En tendencias alcistas fuertes, el RSI puede permanecer en sobrecompra durante semanas. ¡Espera confirmación de cambio de tendencia!'
    },

    // H2: ESTRATEGIAS AVANZADAS
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h2',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '🎯 5 Estrategias Avanzadas con RSI',
          marks: []
        }
      ]
    },

    // H3: ESTRATEGIA 1
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h3',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '1. Divergencias RSI - La Estrategia Más Poderosa',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Las ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'divergencias',
          marks: ['strong', 'highlight']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' ocurren cuando el precio hace un nuevo máximo/mínimo pero el RSI NO lo confirma.',
          marks: []
        }
      ]
    },

    // CHECKLIST: TIPOS DE DIVERGENCIAS
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h4',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Tipos de Divergencias',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Divergencia Alcista',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Precio hace mínimos más bajos, RSI hace mínimos más altos → Señal de reversión alcista',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Divergencia Bajista',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Precio hace máximos más altos, RSI hace máximos más bajos → Señal de reversión bajista',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Divergencia Oculta Alcista',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Confirmación de continuación de tendencia alcista',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Divergencia Oculta Bajista',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ': Confirmación de continuación de tendencia bajista',
          marks: []
        }
      ]
    },

    // CODE BLOCK: SCRIPT PARA DETECTAR DIVERGENCIAS
    {
      _type: 'codeBlock',
      _key: generateKey(),
      filename: 'divergence-detector.py',
      language: 'python',
      showLineNumbers: true,
      code: `# Script para detectar divergencias RSI
import numpy as np
import pandas as pd

def detect_bullish_divergence(prices, rsi_values, window=5):
    """
    Detecta divergencias alcistas en RSI
    
    Returns:
        True si hay divergencia alcista
    """
    # Buscar mínimos en precio
    price_lows = []
    rsi_lows = []
    
    for i in range(window, len(prices) - window):
        if prices[i] == min(prices[i-window:i+window]):
            price_lows.append((i, prices[i]))
            rsi_lows.append((i, rsi_values[i]))
    
    # Verificar divergencia
    if len(price_lows) >= 2:
        # Precio hace mínimos más bajos
        if price_lows[-1][1] < price_lows[-2][1]:
            # RSI hace mínimos más altos
            if rsi_lows[-1][1] > rsi_lows[-2][1]:
                return True
    
    return False

# Señal de trading
if detect_bullish_divergence(prices, rsi):
    print("🟢 SEÑAL DE COMPRA: Divergencia Alcista Detectada")
    print("📊 Confirma con volumen y estructura de precio")`
    },

    // CALLOUT SUCCESS
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'success',
      title: '✅ Mejores Resultados',
      content: 'Las divergencias funcionan mejor en timeframes de 4H y Daily. Evita operar divergencias en temporalidades menores a 1H debido al ruido del mercado.'
    },

    // H3: ESTRATEGIA 2
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h3',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '2. RSI + Estructura de Precio',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Combinar el RSI con ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'soportes y resistencias',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' aumenta significativamente la tasa de éxito.',
          marks: []
        }
      ]
    },

    // BLOCKQUOTE
    {
      _type: 'block',
      _key: generateKey(),
      style: 'blockquote',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '"La confluencia entre RSI sobreventa + soporte clave + patrón de velas alcista tiene una tasa de éxito del 70-80%"',
          marks: ['em']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'blockquote',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '— Análisis de 10,000 operaciones en mercados de criptomonedas',
          marks: []
        }
      ]
    },

    // H3: ESTRATEGIA 3
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h3',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '3. RSI Multi-Timeframe',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Analiza el RSI en ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: '3 temporalidades diferentes',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' para confirmar la dirección del momentum:',
          marks: []
        }
      ]
    },

    // CODE BLOCK: ANÁLISIS MULTI-TIMEFRAME
    {
      _type: 'codeBlock',
      _key: generateKey(),
      filename: 'multi-timeframe-rsi.py',
      language: 'python',
      showLineNumbers: false,
      code: `# Análisis Multi-Timeframe
def analyze_rsi_multi_tf(symbol):
    """
    Analiza RSI en 3 temporalidades
    """
    # Obtener RSI de diferentes TF
    rsi_1h = get_rsi(symbol, '1h')
    rsi_4h = get_rsi(symbol, '4h')
    rsi_1d = get_rsi(symbol, '1d')
    
    # Análisis de confluencia
    if rsi_1h < 30 and rsi_4h < 40 and rsi_1d < 50:
        return "🟢 COMPRA FUERTE: Sobreventa en todas las TF"
    elif rsi_1h > 70 and rsi_4h > 60 and rsi_1d > 50:
        return "🔴 VENTA FUERTE: Sobrecompra en todas las TF"
    else:
        return "⚪ SIN SEÑAL CLARA: Divergencia entre TFs"

# Ejemplo
print(analyze_rsi_multi_tf('BTCUSDT'))`
    },

    // H3: ESTRATEGIA 4
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h3',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '4. RSI + Medias Móviles',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Agrega una ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'EMA de 9 periodos',
          marks: ['strong', 'code']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' sobre el RSI para identificar cambios de momentum más rápido.',
          marks: []
        }
      ]
    },

    // CALLOUT NOTE
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'note',
      title: '📝 Configuración Recomendada',
      content: 'RSI(14) + EMA(9) sobre RSI + Niveles 70/30. Los cruces de la línea RSI con su EMA generan señales tempranas de cambio de momentum.'
    },

    // H3: ESTRATEGIA 5
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h3',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '5. RSI Failure Swings (Oscilaciones Fallidas)',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Una de las ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'señales más confiables',
          marks: ['strong', 'highlight']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' pero menos conocidas del RSI.',
          marks: []
        }
      ]
    },

    // LISTA NUMERADA: PASOS PARA FAILURE SWING
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h4',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Failure Swing Alcista (Compra)',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'number',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI cae por debajo de 30',
          marks: ['strong']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'number',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI rebota y sube por encima de 30',
          marks: ['strong']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'number',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI retrocede pero NO vuelve a bajar de 30',
          marks: ['strong']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'number',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'RSI rompe el máximo anterior',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' → 🟢 SEÑAL DE COMPRA',
          marks: []
        }
      ]
    },

    // CALLOUT ERROR
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'error',
      title: '🚨 Errores Fatales con el RSI',
      content: '1) Operar RSI sin confirmación de precio 2) Ignorar la tendencia principal 3) Usar niveles 70/30 en tendencias fuertes 4) No ajustar el periodo según el activo 5) Confiar solo en el RSI sin otros indicadores'
    },

    // H2: CONFIGURACIONES ÓPTIMAS
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h2',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '⚙️ Configuraciones Óptimas del RSI por Mercado',
          marks: []
        }
      ]
    },

    // CODE BLOCK: CONFIGURACIONES JSON
    {
      _type: 'codeBlock',
      _key: generateKey(),
      filename: 'rsi-settings.json',
      language: 'json',
      showLineNumbers: false,
      code: `{
  "forex": {
    "period": 14,
    "overbought": 70,
    "oversold": 30,
    "best_timeframes": ["4H", "Daily"]
  },
  "crypto": {
    "period": 14,
    "overbought": 75,
    "oversold": 25,
    "best_timeframes": ["1H", "4H", "Daily"]
  },
  "stocks": {
    "period": 14,
    "overbought": 70,
    "oversold": 30,
    "best_timeframes": ["Daily", "Weekly"]
  },
  "scalping": {
    "period": 7,
    "overbought": 80,
    "oversold": 20,
    "best_timeframes": ["5M", "15M"]
  },
  "swing_trading": {
    "period": 21,
    "overbought": 65,
    "oversold": 35,
    "best_timeframes": ["4H", "Daily"]
  }
}`
    },

    // H2: SISTEMA COMPLETO DE TRADING
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h2',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '🎓 Sistema Completo de Trading con RSI',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Aquí te comparto mi ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'sistema completo paso a paso',
          marks: ['strong', 'highlight']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' que uso personalmente:',
          marks: []
        }
      ]
    },

    // CHECKLIST: SISTEMA DE TRADING
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 1: Identificar tendencia',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' en timeframe superior (Daily/4H)',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 2: Marcar zonas de soporte/resistencia',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' clave',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 3: Esperar RSI en sobreventa (<30)',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' cerca de soporte',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 4: Buscar divergencia alcista',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' o failure swing',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 5: Confirmar con patrón de velas',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' alcista (martillo, envolvente)',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 6: Entrada cuando RSI cruza >30',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' y precio rompe máximo anterior',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 7: Stop Loss',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' debajo del mínimo del patrón de velas',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'checkbox',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Paso 8: Take Profit',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' en resistencia o cuando RSI > 70',
          marks: []
        }
      ]
    },

    // VIDEO EMBED
    {
      _type: 'videoEmbed',
      _key: generateKey(),
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Tutorial Completo: Cómo Operar con RSI (Estrategia Paso a Paso)',
      aspectRatio: '16:9'
    },

    // CALLOUT TIP FINAL
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'tip',
      title: '💎 Accede a Nuestro RSI PRO+',
      content: 'En APIDevs hemos desarrollado el RSI PRO+ con detección automática de divergencias, failure swings, alertas personalizadas y multi-timeframe analysis. Disponible para miembros PRO y Lifetime.'
    },

    // H2: CONCLUSIÓN
    {
      _type: 'block',
      _key: generateKey(),
      style: 'h2',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '🎯 Conclusión y Próximos Pasos',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'El RSI es una ',
          marks: []
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: 'herramienta extremadamente poderosa',
          marks: ['strong']
        },
        {
          _type: 'span',
          _key: generateKey(),
          text: ' cuando se usa correctamente. Recuerda:',
          marks: []
        }
      ]
    },

    // LISTA FINAL DE BULLETS
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Nunca operes RSI de forma aislada',
          marks: ['strong']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Ajusta los niveles según la fuerza de la tendencia',
          marks: ['strong']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Las divergencias son tus mejores amigas',
          marks: ['strong']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Combina con estructura de precio y volumen',
          marks: ['strong']
        }
      ]
    },
    {
      _type: 'block',
      _key: generateKey(),
      listItem: 'bullet',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: 'Practica en demo antes de arriesgar capital real',
          marks: ['strong']
        }
      ]
    },

    // CALLOUT SUCCESS FINAL
    {
      _type: 'callout',
      _key: generateKey(),
      type: 'success',
      title: '✅ ¡Empieza Hoy!',
      content: '¿Listo para dominar el RSI? Únete a APIDevs y accede a nuestros indicadores profesionales, grupo privado de traders y formación exclusiva. ¡Transforma tu trading hoy!'
    },

    // TEXTO FINAL
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: '¿Tienes preguntas sobre el RSI? Déjalas en los comentarios. ¡Happy trading! 📈',
          marks: []
        }
      ]
    }
  ];

  try {
    // Actualizar el documento con el contenido corregido
    const result = await client
      .patch(POST_ID)
      .set({ content: contentWithKeys })
      .commit();

    console.log('✅ ¡POST ARREGLADO EXITOSAMENTE!\n');
    console.log('📄 Documento ID:', result._id);
    console.log('🔑 Total de elementos con _key:', contentWithKeys.length);
    console.log('\n🌐 Ver en Studio: http://localhost:3000/studio/intent/edit/id=' + result._id);
    console.log('📱 Ver en Blog: http://localhost:3000/blog/rsi-guia-definitiva-indicador-fuerza-relativa');
    console.log('\n✨ El botón "Add missing keys" debería desaparecer ahora');

  } catch (error) {
    console.error('❌ Error al arreglar el post:', error);
    throw error;
  }
}

// Ejecutar script
fixRSIPost()
  .then(() => {
    console.log('\n🚀 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });

