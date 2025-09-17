import Link from 'next/link';
import Image from 'next/image';
import { Indicator } from './types';

interface IndicatorCardProps {
  indicator: Indicator;
  className?: string;
}

export default function IndicatorCard({ indicator, className = '' }: IndicatorCardProps) {
  const getCategoryBadge = (category: string) => {
    const colors = {
      free: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    const labels = {
      free: 'GRATUITO',
      premium: 'PREMIUM'
    };
    return { color: colors[category as keyof typeof colors], label: labels[category as keyof typeof labels] };
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      indicator: '📈',
      scanner: '🔍',
      tool: '🛠️'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const badge = getCategoryBadge(indicator.category);

  return (
    <Link href={`/indicadores/${indicator.slug}`} className={className}>
      <div className="group bg-gray-900/40 rounded-xl overflow-hidden hover:bg-gray-800/60 transition-all duration-300 border border-gray-800/50 hover:border-gray-700 hover:shadow-xl">
        {/* Imagen */}
        <div className="relative h-56 overflow-hidden bg-gray-800">
          <Image
            src={indicator.image}
            alt={indicator.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badge de Categoría */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Tipo de producto */}
          <div className="absolute top-4 right-4">
            <span className="text-xl bg-black/60 px-2 py-1 rounded-lg" title={indicator.type}>
              {getTypeIcon(indicator.type)}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-7">
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
            {indicator.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
            {indicator.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {indicator.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-md">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {new Date(indicator.publishedAt).toLocaleDateString('es-ES', { 
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <span className="text-green-400 font-medium group-hover:text-green-300 transition-colors">
              Ver detalles →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
