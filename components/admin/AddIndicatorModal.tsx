'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddIndicatorModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pine_id: '',
    name: '',
    description: '',
    category: 'indicador' as 'indicador' | 'escaner' | 'tools',
    status: 'activo' as 'activo' | 'desactivado' | 'desarrollo',
    type: 'privado' as 'privado' | 'publico',
    image_1: '',
    image_2: '',
    image_3: ''
  });

  const [imagePreviews, setImagePreviews] = useState({
    image_1: '',
    image_2: '',
    image_3: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/indicators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        // Reset form
        setFormData({
          pine_id: '',
          name: '',
          description: '',
          category: 'indicador',
          status: 'activo',
          type: 'privado',
          image_1: '',
          image_2: '',
          image_3: ''
        });
        setImagePreviews({
          image_1: '',
          image_2: '',
          image_3: ''
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo crear el indicador'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el indicador');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (field: 'image_1' | 'image_2' | 'image_3', url: string) => {
    setFormData({ ...formData, [field]: url });
    setImagePreviews({ ...imagePreviews, [field]: url });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl transition-all">
                {/* Header */}
                <Dialog.Title className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                      <svg
                        className="h-5 w-5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Agregar Nuevo Indicador
                      </h3>
                      <p className="text-sm text-gray-400">
                        Completa la información del indicador
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Dialog.Title>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Pine ID */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Pine ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="PUB;7c7e236c6da54dc4af78a87b788f126a"
                      value={formData.pine_id}
                      onChange={(e) =>
                        setFormData({ ...formData, pine_id: e.target.value })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      ID público de TradingView (formato: PUB;xxxxx)
                    </p>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Nombre del Indicador <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="RSI Bands Pro"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Descripción detallada del indicador..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Grid de Selects */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Categoría */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Categoría <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as any
                          })
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="indicador">Indicador</option>
                        <option value="escaner">Escaner</option>
                        <option value="tools">Tools</option>
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Estado <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as any
                          })
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="activo">Activo</option>
                        <option value="desactivado">Desactivado</option>
                        <option value="desarrollo">En Desarrollo</option>
                      </select>
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Tipo <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as any
                          })
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="privado">Privado (Requiere suscripción)</option>
                        <option value="publico">Público (Gratuito)</option>
                      </select>
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">
                      Imágenes del Indicador
                    </h4>
                    
                    {/* Imagen 1 */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-400">
                        Imagen 1 (Principal)
                      </label>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/imagen1.png"
                        value={formData.image_1}
                        onChange={(e) => handleImageUrlChange('image_1', e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      {imagePreviews.image_1 && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
                          <Image
                            src={imagePreviews.image_1}
                            alt="Preview 1"
                            width={400}
                            height={200}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>

                    {/* Imagen 2 */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-400">
                        Imagen 2
                      </label>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/imagen2.png"
                        value={formData.image_2}
                        onChange={(e) => handleImageUrlChange('image_2', e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      {imagePreviews.image_2 && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
                          <Image
                            src={imagePreviews.image_2}
                            alt="Preview 2"
                            width={400}
                            height={200}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>

                    {/* Imagen 3 */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-400">
                        Imagen 3
                      </label>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/imagen3.png"
                        value={formData.image_3}
                        onChange={(e) => handleImageUrlChange('image_3', e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      {imagePreviews.image_3 && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
                          <Image
                            src={imagePreviews.image_3}
                            alt="Preview 3"
                            width={400}
                            height={200}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 font-medium text-white transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Crear Indicador'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

