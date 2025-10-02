'use client';

import { Package, TrendingUp, Award } from 'lucide-react';

interface TopProductsProps {
  products: {
    name: string;
    sales: number;
    revenue: number;
  }[];
}

export default function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calcular total para porcentajes
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);

  // Top 5 productos
  const topProducts = products.slice(0, 5);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top Productos</h3>
            <p className="text-sm text-gray-400">Los 5 más vendidos</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-lg font-bold text-white">{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => {
            const percentage = totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
            const isTop3 = index < 3;

            return (
              <div
                key={product.name}
                className={`
                  group p-4 rounded-xl border transition-all duration-200
                  ${isTop3 
                    ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20 hover:border-yellow-500/40' 
                    : 'bg-gray-800/20 border-gray-700/30 hover:border-gray-600/50'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Ranking */}
                  <div className="flex-shrink-0 w-8 text-center">
                    {isTop3 ? (
                      <span className="text-2xl">{medals[index]}</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="text-sm font-medium text-white truncate">
                        {product.name}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{product.sales} ventas</span>
                      <span>•</span>
                      <span>{percentage}% del total</span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${isTop3 ? 'text-yellow-400' : 'text-white'}`}>
                      {formatCurrency(product.revenue)}
                    </div>
                    <div className="text-[10px] text-gray-500">revenue</div>
                  </div>

                  {/* Trend Icon */}
                  <div className="flex-shrink-0">
                    <TrendingUp className={`w-5 h-5 ${isTop3 ? 'text-yellow-400' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop3 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <div className="text-sm text-gray-500">No hay productos para mostrar</div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {topProducts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
          <span>Total de productos: {products.length}</span>
          <span>Total ventas: {totalSales}</span>
        </div>
      )}
    </div>
  );
}

