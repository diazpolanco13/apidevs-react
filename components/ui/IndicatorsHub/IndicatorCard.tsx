import Link from 'next/link';
import Image from 'next/image';
import type { IndicatorListItem } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/image';

interface IndicatorCardProps {
  indicator: IndicatorListItem;
  className?: string;
}

export default function IndicatorCard({ indicator, className = '' }: IndicatorCardProps) {
  const getCategoryBadge = (tier: 'free' | 'premium') => {
    const colors = {
      free: 'bg-blue-600',
      premium: 'bg-purple-600'
    };
    const labels = {
      free: '🎁 GRATIS',
      premium: '💎 PREMIUM'
    };
    return { color: colors[tier], label: labels[tier] };
  };

  const getCategoryIcon = (category: string | undefined) => {
    if (!category) return '📊';
    const icons: Record<string, string> = {
      indicador: '📈',
      escaner: '🔍',
      scanner: '🔍',
      tools: '🛠️',
      tool: '🛠️'
    };
    return icons[category.toLowerCase()] || '📊';
  };

  const getCategoryLabel = (category: string | undefined) => {
    if (!category) return 'Herramienta';
    const labels: Record<string, string> = {
      indicador: 'Indicador',
      escaner: 'Scanner',
      scanner: 'Scanner',
      tools: 'Herramienta',
      tool: 'Herramienta'
    };
    return labels[category.toLowerCase()] || 'Herramienta';
  };

  const badge = getCategoryBadge(indicator.access_tier);
  const imageUrl = indicator.mainImage?.asset ? urlForImage(indicator.mainImage)?.width(800).height(600).url() : null;

  return (
    <Link href={`/indicadores/${indicator.slug}`} className={className}>
      <div className="group relative h-full bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-apidevs-primary/10">
        
        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 group-hover:translate-x-full pointer-events-none"></div>
        
        {/* Imagen Principal */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={indicator.mainImage?.alt || indicator.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-60"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900">
              <span className="text-7xl opacity-20">{getCategoryIcon(indicator.category)}</span>
            </div>
          )}
          
          {/* Badge Premium/Free - Top Left */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Tipo de Categoría - Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-sm">{getCategoryIcon(indicator.category)}</span>
              <span className="text-xs font-medium text-white">{getCategoryLabel(indicator.category)}</span>
            </div>
          </div>

          {/* Indicador "Nuevo" si tiene menos de 30 días */}
          {indicator.publishedAt && 
           new Date().getTime() - new Date(indicator.publishedAt).getTime() < 30 * 24 * 60 * 60 * 1000 && (
            <div className="absolute bottom-3 right-3 z-10">
              <span className="px-2.5 py-1 bg-apidevs-primary text-black text-xs font-bold rounded-full shadow-lg animate-pulse">
                NUEVO
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Título */}
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-apidevs-primary transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
            {indicator.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {indicator.shortDescription}
          </p>
          
          {/* Features Preview con ícono mejorado */}
          {indicator.features && indicator.features.length > 0 && (
            <div className="mb-4 flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1 flex-1">
                {indicator.features[0]}
              </p>
            </div>
          )}

          {/* Tags */}
          {indicator.tags && indicator.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {indicator.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 bg-gray-800/80 text-gray-300 text-xs rounded-md border border-gray-700/50 hover:border-gray-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {indicator.tags.length > 3 && (
                <span className="px-2.5 py-1 bg-gray-800/80 text-gray-400 text-xs rounded-md border border-gray-700/50">
                  +{indicator.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer con línea divisoria */}
          <div className="pt-4 border-t border-gray-800/50">
            <div className="flex items-center justify-between">
              {/* Fecha */}
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {indicator.publishedAt ? new Date(indicator.publishedAt).toLocaleDateString('es-ES', { 
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Reciente'}
                </span>
              </div>

              {/* CTA Button */}
              <div className="flex items-center gap-1.5 text-apidevs-primary font-semibold text-sm group-hover:text-apidevs-primary-dark transition-colors">
                <span>Ver más</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Borde brillante en hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-apidevs-primary/0 group-hover:border-apidevs-primary/20 transition-all duration-500 pointer-events-none"></div>
      </div>
    </Link>
  );
}
