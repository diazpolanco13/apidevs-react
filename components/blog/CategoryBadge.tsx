'use client';

interface CategoryBadgeProps {
  category: {
    title: string;
    slug: string;
    color: string;
    icon?: string;
  };
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  primary: 'bg-apidevs-primary/20 text-apidevs-primary border-apidevs-primary/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  const colorClasses = colorMap[category.color] || colorMap.primary;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-sm ${sizeClasses} ${colorClasses}`}
    >
      {category.icon && <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>{category.icon}</span>}
      <span>{category.title}</span>
    </span>
  );
}

