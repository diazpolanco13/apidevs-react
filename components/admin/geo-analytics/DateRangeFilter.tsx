'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, TrendingUp } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangeFilterProps {
  onDateChange: (from: Date, to: Date) => void;
  defaultRange?: 'today' | 'week' | 'month' | 'lastMonth' | 'quarter' | 'custom';
}

export default function DateRangeFilter({ onDateChange, defaultRange = 'month' }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>(defaultRange);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Calcular rangos predefinidos
  const getRanges = (): Record<string, DateRange> => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      today: {
        from: today,
        to: now,
        label: 'Hoy'
      },
      week: {
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: now,
        label: 'Últimos 7 días'
      },
      month: {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: now,
        label: 'Este mes'
      },
      lastMonth: {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
        label: 'Mes anterior'
      },
      quarter: {
        from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        to: now,
        label: 'Últimos 90 días'
      },
      all: {
        from: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
        to: now,
        label: 'Último año'
      }
    };
  };

  const ranges = getRanges();
  const currentRange = ranges[selectedRange as keyof typeof ranges];

  const handleRangeSelect = (rangeKey: string) => {
    setSelectedRange(rangeKey);
    const range = ranges[rangeKey as keyof typeof ranges];
    if (range) {
      onDateChange(range.from, range.to);
    }
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      const from = new Date(customFrom);
      const to = new Date(customTo);
      to.setHours(23, 59, 59, 999); // Incluir todo el día final
      
      if (from <= to) {
        setSelectedRange('custom');
        onDateChange(from, to);
        setIsOpen(false);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all group"
      >
        <Calendar className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-white font-medium">
          {selectedRange === 'custom' && customFrom && customTo 
            ? `${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))}`
            : currentRange?.label || 'Seleccionar período'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
            {/* Presets */}
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-400 px-3 py-2">
                PERÍODOS RÁPIDOS
              </div>
              {Object.entries(ranges).map(([key, range]) => (
                <button
                  key={key}
                  onClick={() => handleRangeSelect(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedRange === key
                      ? 'bg-purple-500/20 text-white border border-purple-500/30'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span>{range.label}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(range.from)} - {formatDate(range.to)}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Range */}
            <div className="border-t border-white/10 p-4">
              <div className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                RANGO PERSONALIZADO
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Desde</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    max={customTo || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    min={customFrom}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  disabled={!customFrom || !customTo}
                  className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar Rango
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

