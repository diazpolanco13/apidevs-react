import { 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface UserStatsProps {
  totalPurchases: number;
  completedPurchases: number;
  totalSpentUSD: number;
  averageOrderValue: number;
  productBreakdown: { [key: string]: number };
}

export default function UserStats({ 
  totalPurchases, 
  completedPurchases, 
  totalSpentUSD, 
  averageOrderValue, 
  productBreakdown 
}: UserStatsProps) {
  const stats = [
    {
      name: 'Total Compras',
      value: totalPurchases.toString(),
      description: `${completedPurchases} completadas`,
      icon: ShoppingCartIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      name: 'Total Gastado',
      value: `$${totalSpentUSD.toFixed(2)}`,
      description: 'Solo compras completadas',
      icon: CurrencyDollarIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      name: 'Valor Promedio',
      value: `$${averageOrderValue.toFixed(2)}`,
      description: 'Por orden completada',
      icon: ChartBarIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      name: 'Productos Únicos',
      value: Object.keys(productBreakdown).length.toString(),
      description: 'Tipos diferentes',
      icon: CubeIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className={`${stat.bgColor} backdrop-blur-xl border rounded-lg p-4 transition-all duration-200 hover:scale-105`}
          >
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">{stat.name}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Product breakdown */}
      {Object.keys(productBreakdown).length > 0 && (
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Productos Comprados</h3>
          <div className="space-y-3">
            {Object.entries(productBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([product, count]) => (
                <div key={product} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-apidevs-primary rounded-full mr-3"></div>
                    <span className="text-white text-sm">{product}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-apidevs-primary font-semibold text-sm mr-2">
                      {count}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {count === 1 ? 'compra' : 'compras'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
