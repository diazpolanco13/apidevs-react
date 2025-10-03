'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';

type Indicator = {
  id: string;
  pine_id: string;
  tradingview_url: string | null;
  public_script_url: string | null;
  name: string;
  description: string | null;
  category: 'indicador' | 'escaner' | 'tools';
  status: 'activo' | 'desactivado' | 'desarrollo';
  type: 'privado' | 'publico';
  access_tier: 'free' | 'premium';
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
};

type Props = {
  indicator: Indicator;
};

export default function EditIndicatorForm({ indicator }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tradingview_url: indicator.tradingview_url || '',
    public_script_url: indicator.public_script_url || '',
    pine_id: indicator.pine_id,
    name: indicator.name,
    description: indicator.description || '',
    category: indicator.category,
    status: indicator.status,
    type: indicator.type,
    access_tier: indicator.access_tier,
    image_1: indicator.image_1 || '',
    image_2: indicator.image_2 || '',
    image_3: indicator.image_3 || ''
  });

  // Función para extraer y convertir Pine ID desde URL de TradingView
  const extractPineIdFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const idParam = urlObj.searchParams.get('id');
      if (idParam) {
        return decodeURIComponent(idParam);
      }
      return null;
    } catch {
      return null;
    }
  };

  // Manejar cambio de URL de TradingView
  const handleTradingViewUrlChange = (url: string) => {
    setFormData({ ...formData, tradingview_url: url });
    
    const extractedPineId = extractPineIdFromUrl(url);
    if (extractedPineId && extractedPineId.startsWith('PUB;')) {
      setFormData(prev => ({
        ...prev,
        tradingview_url: url,
        pine_id: extractedPineId
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validar Pine ID
      if (!formData.pine_id.startsWith('PUB;')) {
        throw new Error('El Pine ID debe comenzar con "PUB;"');
      }

      const response = await fetch(`/api/admin/indicators/${indicator.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el indicador');
      }

      // Redirigir a la página de detalles del indicador
      router.push(`/admin/indicadores/${indicator.id}`);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/indicadores/${indicator.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-red-400">Error</h3>
              <p className="mt-1 text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Grid de URLs */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* URL del Código (Pine Editor) */}
          <div>
            <label
              htmlFor="tradingview_url"
              className="block text-sm font-medium text-gray-300"
            >
              URL del Código (Pine Editor)
            </label>
            <input
              type="url"
              id="tradingview_url"
              placeholder="https://www.tradingview.com/pine/?id=PUB%3Baf43..."
              value={formData.tradingview_url}
              onChange={(e) => handleTradingViewUrlChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <svg
                className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <p className="text-xs text-blue-300">
                <strong>Para ti:</strong> Acceso rápido al editor. Extrae el Pine ID automáticamente.
              </p>
            </div>
          </div>

          {/* URL Pública del Script */}
          <div>
            <label
              htmlFor="public_script_url"
              className="block text-sm font-medium text-gray-300"
            >
              URL Pública del Script
            </label>
            <input
              type="url"
              id="public_script_url"
              placeholder="https://www.tradingview.com/script/WRcehVHw-RSI-SCANNER/"
              value={formData.public_script_url}
              onChange={(e) =>
                setFormData({ ...formData, public_script_url: e.target.value })
              }
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
              <svg
                className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <p className="text-xs text-purple-300">
                <strong>Para usuarios:</strong> Vista pública del indicador, dar likes, marketing.
              </p>
            </div>
          </div>
        </div>

        {/* Pine ID */}
        <div>
          <label htmlFor="pine_id" className="block text-sm font-medium text-gray-300">
            Pine ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="pine_id"
            required
            placeholder="PUB;7c7e236c6da54dc4af78a87b788f126a"
            value={formData.pine_id}
            onChange={(e) =>
              setFormData({ ...formData, pine_id: e.target.value })
            }
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-emerald-400 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.pine_id
              ? '✅ ID en formato correcto para el bot'
              : 'ID público de TradingView (formato: PUB;xxxxx)'}
          </p>
        </div>

        {/* Nombre del Indicador */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Nombre del Indicador <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            placeholder="RSI Bands Pro"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Descripción detallada del indicador..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Grid de 4 columnas: Categoría, Estado, Tipo, Nivel de Acceso */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Categoría */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-300"
            >
              Categoría <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as 'indicador' | 'escaner' | 'tools'
                })
              }
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="indicador">Indicador</option>
              <option value="escaner">Escaner</option>
              <option value="tools">Tools</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-300"
            >
              Estado <span className="text-red-400">*</span>
            </label>
            <select
              id="status"
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as
                    | 'activo'
                    | 'desactivado'
                    | 'desarrollo'
                })
              }
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="activo">Activo</option>
              <option value="desactivado">Desactivado</option>
              <option value="desarrollo">Desarrollo</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300">
              Tipo <span className="text-red-400">*</span>
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as 'privado' | 'publico'
                })
              }
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="privado">Privado (Requiere suscripción)</option>
              <option value="publico">Público</option>
            </select>
          </div>

          {/* Nivel de Acceso (FREE/PREMIUM) */}
          <div>
            <label
              htmlFor="access_tier"
              className="block text-sm font-medium text-gray-300"
            >
              Nivel de Acceso <span className="text-red-400">*</span>
            </label>
            <select
              id="access_tier"
              required
              value={formData.access_tier}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  access_tier: e.target.value as 'free' | 'premium'
                })
              }
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="premium">💎 Premium (De Pago)</option>
              <option value="free">🎁 Free (Gratuito)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.access_tier === 'premium'
                ? 'Solo usuarios con suscripción activa'
                : 'Disponible para todos los usuarios'}
            </p>
          </div>
        </div>

        {/* Imágenes del Indicador */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">
              Imágenes del Indicador
            </h3>
            <span className="text-xs text-gray-500">
              Hasta 3 imágenes (5MB cada una)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Imagen 1 (Principal) */}
            <ImageUploader
              imageUrl={formData.image_1}
              imageNumber={1}
              onUpload={(url) => setFormData({ ...formData, image_1: url })}
              onRemove={() => setFormData({ ...formData, image_1: '' })}
            />

            {/* Imagen 2 */}
            <ImageUploader
              imageUrl={formData.image_2}
              imageNumber={2}
              onUpload={(url) => setFormData({ ...formData, image_2: url })}
              onRemove={() => setFormData({ ...formData, image_2: '' })}
            />

            {/* Imagen 3 */}
            <ImageUploader
              imageUrl={formData.image_3}
              imageNumber={3}
              onUpload={(url) => setFormData({ ...formData, image_3: url })}
              onRemove={() => setFormData({ ...formData, image_3: '' })}
            />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-4 border-t border-zinc-800 pt-6">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-gray-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Actualizar Indicador
            </>
          )}
        </button>
      </div>
    </form>
  );
}

