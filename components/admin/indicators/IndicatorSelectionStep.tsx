'use client';

import { useState, useEffect } from 'react';
import { Search, Target, Check } from 'lucide-react';

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
  category: string;
  access_tier: string;
  status: string;
};

type IndicatorSelectionStepProps = {
  selectedIndicators: Indicator[];
  onSelectionChange: (indicators: Indicator[]) => void;
};

export default function IndicatorSelectionStep({
  selectedIndicators,
  onSelectionChange
}: IndicatorSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/indicators');
      if (response.ok) {
        const data = await response.json();
        // Indicadores recibidos
        // Solo indicadores activos (el status en BD es 'activo' en español)
        setIndicators(
          data.indicators?.filter((ind: Indicator) => ind.status === 'activo') || []
        );
        // Indicadores activos filtrados
      }
    } catch (error) {
      console.error('❌ Error cargando indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar indicadores
  const filteredIndicators = indicators.filter((indicator) => {
    const matchesSearch =
      searchQuery === '' ||
      indicator.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier =
      filterTier === 'all' || indicator.access_tier === filterTier;
    const matchesCategory =
      filterCategory === 'all' || indicator.category === filterCategory;

    return matchesSearch && matchesTier && matchesCategory;
  });

  // Categorías únicas
  const categories = Array.from(
    new Set(indicators.map((ind) => ind.category))
  ).sort();

  const toggleIndicatorSelection = (indicator: Indicator) => {
    const isSelected = selectedIndicators.some((i) => i.id === indicator.id);
    if (isSelected) {
      onSelectionChange(selectedIndicators.filter((i) => i.id !== indicator.id));
    } else {
      onSelectionChange([...selectedIndicators, indicator]);
    }
  };

  const selectAllFiltered = () => {
    const allIds = new Set(selectedIndicators.map((i) => i.id));
    const newIndicators = filteredIndicators.filter((i) => !allIds.has(i.id));
    onSelectionChange([...selectedIndicators, ...newIndicators]);
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const selectAllFree = () => {
    const freeIndicators = indicators.filter((i) => i.access_tier === 'free');
    onSelectionChange(freeIndicators);
  };

  const selectAllPremium = () => {
    const premiumIndicators = indicators.filter(
      (i) => i.access_tier === 'premium'
    );
    onSelectionChange(premiumIndicators);
  };

  const isIndicatorSelected = (indicatorId: string) =>
    selectedIndicators.some((i) => i.id === indicatorId);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar indicador por nombre..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:border-apidevs-primary focus:outline-none focus:ring-2 focus:ring-apidevs-primary/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Tier Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Filtrar por Tier
            </label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white focus:border-apidevs-primary focus:outline-none focus:ring-2 focus:ring-apidevs-primary/20"
            >
              <option value="all">Todos los tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white focus:border-apidevs-primary focus:outline-none focus:ring-2 focus:ring-apidevs-primary/20"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={selectAllFree}
            className="rounded-lg border border-blue-600 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            🎁 Todos Free ({indicators.filter((i) => i.access_tier === 'free').length})
          </button>
          <button
            onClick={selectAllPremium}
            className="rounded-lg border border-purple-600 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20"
          >
            💎 Todos Premium ({indicators.filter((i) => i.access_tier === 'premium').length})
          </button>
          <button
            onClick={selectAllFiltered}
            disabled={filteredIndicators.length === 0}
            className="rounded-lg border border-emerald-600 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
          >
            Seleccionar filtrados ({filteredIndicators.length})
          </button>
          <button
            onClick={deselectAll}
            disabled={selectedIndicators.length === 0}
            className="rounded-lg border border-red-600 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            Deseleccionar todos
          </button>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-purple-400" />
          <div>
            <p className="font-medium text-purple-300">
              {selectedIndicators.length} indicador{selectedIndicators.length !== 1 ? 'es' : ''}{' '}
              seleccionado{selectedIndicators.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-1 flex gap-3 text-sm text-purple-400/70">
              <span>
                🎁 Free:{' '}
                {selectedIndicators.filter((i) => i.access_tier === 'free').length}
              </span>
              <span>
                💎 Premium:{' '}
                {selectedIndicators.filter((i) => i.access_tier === 'premium').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            Cargando indicadores...
          </div>
        ) : filteredIndicators.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            No se encontraron indicadores
          </div>
        ) : (
          filteredIndicators.map((indicator) => {
            const selected = isIndicatorSelected(indicator.id);

            return (
              <div
                key={indicator.id}
                onClick={() => toggleIndicatorSelection(indicator)}
                className={`group relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  selected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
                }`}
              >
                {/* Checkbox */}
                <div className="absolute right-3 top-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded border-2 transition-all ${
                      selected
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-600 group-hover:border-zinc-500'
                    }`}
                  >
                    {selected && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>

                {/* Content */}
                <div className="pr-8">
                  <h3 className="mb-2 font-semibold text-white line-clamp-2">
                    {indicator.name}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        indicator.access_tier === 'free'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {indicator.access_tier === 'free' ? '🎁 Free' : '💎 Premium'}
                    </span>
                    <span className="inline-flex rounded-full bg-zinc-700/50 px-2 py-1 text-xs font-medium text-gray-300">
                      {indicator.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

