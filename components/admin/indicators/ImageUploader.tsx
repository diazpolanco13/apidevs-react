'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

type Props = {
  imageUrl: string;
  imageNumber: 1 | 2 | 3;
  onUpload: (url: string) => void;
  onRemove: () => void;
};

export default function ImageUploader({
  imageUrl,
  imageNumber,
  onUpload,
  onRemove
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo JPG, PNG, WebP o GIF.');
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es muy grande. Máximo 5MB.');
      }

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `indicators/${fileName}`;

      // Subir a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('indicator-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const {
        data: { publicUrl }
      } = supabase.storage.from('indicator-images').getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleRemove = async () => {
    if (!imageUrl) return;

    try {
      // Extraer el path del URL público
      const url = new URL(imageUrl);
      const path = url.pathname.split('/indicator-images/')[1];

      if (path) {
        await supabase.storage.from('indicator-images').remove([path]);
      }

      onRemove();
    } catch (err) {
      console.error('Error removing image:', err);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-2">
        Imagen {imageNumber} {imageNumber === 1 && '(Principal)'}
      </label>

      {imageUrl ? (
        // Preview de imagen existente
        <div className="relative group">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
            <Image
              src={imageUrl}
              alt={`Imagen ${imageNumber}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg">
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              Eliminar
            </button>
            <label className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
              Cambiar
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      ) : (
        // Área de upload
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-zinc-700 bg-zinc-800/50'
          } ${uploading ? 'opacity-50' : 'hover:border-zinc-600'}`}
        >
          {uploading ? (
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10 animate-spin text-emerald-400"
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
              <p className="mt-2 text-sm text-gray-400">Subiendo...</p>
            </div>
          ) : (
            <>
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-300">
                Arrastra una imagen aquí o{' '}
                <label className="cursor-pointer font-medium text-emerald-400 hover:text-emerald-300">
                  busca en tu PC
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleChange}
                    disabled={uploading}
                  />
                </label>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, WebP o GIF (máx. 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

