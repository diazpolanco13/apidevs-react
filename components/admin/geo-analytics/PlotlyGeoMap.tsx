'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { PlotParams } from 'react-plotly.js';

// Importar Plotly dinámicamente para evitar SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface CountryData {
  country: string;
  country_name: string;
  total_visits: number;
  total_purchases: number;
  total_revenue_cents: number;
  conversion_rate: number;
  avg_latitude: number;
  avg_longitude: number;
  avg_time_on_site: number;
  avg_pages_visited: number;
}

interface PlotlyGeoMapProps {
  countries: CountryData[];
}

export default function PlotlyGeoMap({ countries }: PlotlyGeoMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl flex items-center justify-center border border-white/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando mapa interactivo...</p>
        </div>
      </div>
    );
  }

  // Helper function para obtener emoji de bandera
  const getFlagEmoji = (countryCode: string): string => {
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '🌍';
    }
  };

  // Preparar datos para Plotly
  const latitudes = countries.map(c => c.avg_latitude);
  const longitudes = countries.map(c => c.avg_longitude);
  const sizes = countries.map(c => c.total_visits);
  const colors = countries.map(c => c.conversion_rate);
  const texts = countries.map(c => `${getFlagEmoji(c.country)} ${c.country_name}`);
  
  // Crear hover text personalizado
  const hoverTexts = countries.map(c => 
    `<b>${getFlagEmoji(c.country)} ${c.country_name}</b><br>` +
    `<br>` +
    `👥 Visitas: <b>${c.total_visits.toLocaleString()}</b><br>` +
    `🛒 Compras: <b>${c.total_purchases}</b><br>` +
    `📊 Conversión: <b>${c.conversion_rate.toFixed(1)}%</b><br>` +
    `💰 Revenue: <b>$${(c.total_revenue_cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</b><br>` +
    `⏱️ Tiempo promedio: <b>${formatTime(c.avg_time_on_site)}</b><br>` +
    `📄 Páginas/visita: <b>${c.avg_pages_visited.toFixed(1)}</b>` +
    `<extra></extra>`
  );

  // Formatear tiempo
  function formatTime(seconds: number) {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  // Configuración del mapa
  const data: PlotParams['data'] = [
    {
      type: 'scattergeo',
      mode: 'markers',
      lon: longitudes,
      lat: latitudes,
      text: texts,
      hovertext: hoverTexts,
      hovertemplate: '%{hovertext}',
      marker: {
        size: sizes,
        color: colors,
        colorscale: [
          [0, '#ef4444'],      // Rojo para baja conversión
          [0.3, '#eab308'],    // Amarillo para media conversión  
          [0.5, '#10b981'],    // Verde para alta conversión
          [1, '#059669']       // Verde oscuro para muy alta
        ],
        cmin: 0,
        cmax: 100,
        sizemode: 'diameter',
        sizeref: Math.max(...sizes) / 50,
        sizemin: 8,
        line: {
          color: 'rgba(255, 255, 255, 0.8)',
          width: 2
        },
        colorbar: {
          title: {
            text: 'Conversión %',
            font: {
              color: 'rgba(255, 255, 255, 0.8)',
              size: 12
            }
          },
          tickfont: {
            color: 'rgba(255, 255, 255, 0.8)',
            size: 10
          },
          thickness: 15,
          len: 0.7,
          x: 1.02,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          bordercolor: 'rgba(139, 92, 246, 0.3)',
          borderwidth: 1,
          outlinecolor: 'rgba(139, 92, 246, 0.3)',
          outlinewidth: 1
        }
      },
    }
  ];

  const layout: Partial<PlotParams['layout']> = {
    geo: {
      projection: {
        type: 'natural earth'
      },
      showland: true,
      landcolor: 'rgba(30, 30, 40, 0.9)',
      showocean: true,
      oceancolor: 'rgba(15, 15, 25, 0.95)',
      showlakes: true,
      lakecolor: 'rgba(20, 20, 30, 0.9)',
      showcountries: true,
      countrycolor: 'rgba(139, 92, 246, 0.2)',
      countrywidth: 0.5,
      showcoastlines: true,
      coastlinecolor: 'rgba(139, 92, 246, 0.3)',
      coastlinewidth: 1,
      bgcolor: 'rgba(15, 23, 42, 0.95)',
      showframe: false,
      resolution: 50,
    },
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)',
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 0,
      pad: 0
    },
    height: 600,
    font: {
      family: 'Work Sans, system-ui, -apple-system, sans-serif',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    hoverlabel: {
      bgcolor: 'rgba(0, 0, 0, 0.95)',
      bordercolor: 'rgba(139, 92, 246, 0.5)',
      font: {
        family: 'Work Sans, system-ui, -apple-system, sans-serif',
        size: 13,
        color: 'white'
      },
      align: 'left'
    },
    dragmode: 'pan',
  };

  const config: Partial<PlotParams['config']> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'resetScale2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'geo-analytics-map',
      height: 1080,
      width: 1920,
      scale: 2
    },
    scrollZoom: true,
  };

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden bg-slate-950 border border-purple-500/20">
      <Plot
        data={data}
        layout={layout}
        config={config}
        className="w-full h-full"
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Leyenda personalizada overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-2xl">
        <h4 className="text-white font-bold text-sm mb-3">Tasa de Conversión</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
            <span className="text-xs text-gray-300">≥ 50% (Alta)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
            <span className="text-xs text-gray-300">30-50% (Media)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
            <span className="text-xs text-gray-300">&lt; 30% (Baja)</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
          <span className="block">🖱️ Arrastra para mover</span>
          <span className="block mt-1">🔍 Scroll para zoom</span>
          <span className="block mt-1">📍 Tamaño = Volumen</span>
        </div>
      </div>

      {/* Instrucciones de interacción */}
      <div className="absolute top-6 right-6 z-[1000] bg-black/80 backdrop-blur-xl border border-purple-500/20 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span className="text-purple-400">💡</span>
          <span>Pasa el mouse sobre los países para ver detalles</span>
        </div>
      </div>
    </div>
  );
}

