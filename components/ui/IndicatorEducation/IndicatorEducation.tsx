'use client';

import Image from 'next/image';
import { Indicator } from '@/components/ui/IndicatorsHub/types';

interface IndicatorEducationProps {
  indicator: Indicator;
}

interface EducationSection {
  title: string;
  content: string;
  image?: string;
  points?: string[];
}

export default function IndicatorEducation({ indicator }: IndicatorEducationProps) {
  
  // Contenido educativo específico por indicador
  const getEducationContent = (): EducationSection[] => {
    // Contenido base que se puede personalizar por indicador
    const baseContent: EducationSection[] = [
      {
        title: "Conceptos Fundamentales",
        content: `El ${indicator.title} utiliza algoritmos avanzados para identificar patrones de mercado específicos que los traders profesionales buscan constantemente.`,
        image: indicator.image,
        points: [
          "Análisis matemático preciso de la acción del precio",
          "Detección automática de patrones rentables",
          "Señales filtradas para reducir ruido del mercado",
          "Compatibilidad con múltiples timeframes"
        ]
      },
      {
        title: "Cómo Interpretar las Señales",
        content: "Las señales generadas por este indicador están diseñadas para ser claras e inequívocas, eliminando la subjetividad del análisis técnico tradicional.",
        points: [
          "🟢 Señal Verde: Oportunidad de compra identificada",
          "🔴 Señal Roja: Oportunidad de venta identificada", 
          "⚪ Zona Neutral: Mercado en consolidación",
          "📊 Niveles de Confirmación: Validación adicional de la señal"
        ]
      },
      {
        title: "Configuración Recomendada",
        content: "Para obtener los mejores resultados, recomendamos estas configuraciones específicas según tu estilo de trading.",
        points: [
          "Scalping: Timeframe 1-5 minutos, sensibilidad alta",
          "Day Trading: Timeframe 15-60 minutos, sensibilidad media",
          "Swing Trading: Timeframe 4H-1D, sensibilidad baja",
          "Position Trading: Timeframe 1D-1W, filtros adicionales"
        ]
      }
    ];

    // Personalización por tipo de indicador
    if (indicator.type === 'scanner') {
      baseContent[0].content = `El ${indicator.title} escanea múltiples activos simultáneamente para identificar las mejores oportunidades del mercado en tiempo real.`;
      baseContent[0].points = [
        "Análisis simultáneo de 160+ criptomonedas",
        "Filtros avanzados por volatilidad y volumen",
        "Ranking automático por potencial de ganancia",
        "Alertas instantáneas de nuevas oportunidades"
      ];
    } else if (indicator.type === 'tool') {
      baseContent[0].content = `La ${indicator.title} es una herramienta esencial para optimizar la gestión de riesgo y maximizar la rentabilidad de tus operaciones.`;
      baseContent[0].points = [
        "Cálculos automáticos precisos",
        "Integración con tu estrategia de trading",
        "Resultados instantáneos y confiables",
        "Compatible con cualquier activo financiero"
      ];
    }

    return baseContent;
  };

  const educationSections = getEducationContent();

  return (
    <div className="space-y-16">
      {educationSections.map((section, index) => (
        <div key={index} className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-6">
            {section.title}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Contenido de texto */}
            <div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {section.content}
              </p>
              
              {section.points && (
                <div className="space-y-3">
                  {section.points.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-400 leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Imagen ilustrativa */}
            {section.image && (
              <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                <Image
                  src={section.image}
                  alt={`${section.title} - ${indicator.title}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">
                    Ejemplo: {section.title}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Nota adicional para secciones específicas */}
          {index === 1 && (
            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-300 font-semibold mb-2">💡 Consejo Profesional</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Siempre combina las señales del indicador con tu análisis de contexto de mercado. 
                    Las mejores oportunidades ocurren cuando múltiples factores se alinean a tu favor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Sección de casos de uso prácticos */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-6">
          Casos de Uso Reales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-green-400 text-2xl mb-3">📈</div>
            <h4 className="text-white font-semibold mb-2">Tendencia Alcista</h4>
            <p className="text-gray-400 text-sm">
              Identifica puntos óptimos de entrada durante retrocesos en tendencias alcistas establecidas.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-red-400 text-2xl mb-3">📉</div>
            <h4 className="text-white font-semibold mb-2">Tendencia Bajista</h4>
            <p className="text-gray-400 text-sm">
              Detecta rebotes técnicos para posiciones cortas en mercados en declive.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-yellow-400 text-2xl mb-3">↔️</div>
            <h4 className="text-white font-semibold mb-2">Mercados Laterales</h4>
            <p className="text-gray-400 text-sm">
              Aprovecha las oscilaciones en rangos de consolidación para operaciones de corto plazo.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-purple-400 text-2xl mb-3">🎯</div>
            <h4 className="text-white font-semibold mb-2">Puntos de Inflexión</h4>
            <p className="text-gray-400 text-sm">
              Anticipa cambios de tendencia en niveles clave de soporte y resistencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
