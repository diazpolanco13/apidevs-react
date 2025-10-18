'use client';

import { useState } from 'react';
import { X, Plus, FileText, BookOpen, BarChart3, Loader2, Upload, CheckCircle, Image, Wand2 } from 'lucide-react';
import { useSanityIntegration } from '@/hooks/useSanityIntegration';
import GrokImageGenerator from './GrokImageGenerator';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateContentModal({ isOpen, onClose, onSuccess }: CreateContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    mainImage: {
      prompt: '',
      alt: '',
      caption: ''
    },
    tags: [] as string[],
    readingTime: 0,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[]
    },
    type: 'blog' as 'blog' | 'docs' | 'indicators',
    language: 'es' as 'es' | 'en',
    user_prompt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sanityResult, setSanityResult] = useState<any>(null);
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const { createContent, config, loading: sanityLoading } = useSanityIntegration();

  const handleGenerateWithAI = async () => {
    if (!formData.user_prompt.trim()) {
      setError('Por favor ingresa un prompt para generar el contenido');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Llamar a la API para generar contenido con IA
      const response = await fetch('/api/admin/content-creator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: formData.user_prompt,
          type: formData.type,
          language: formData.language,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error generando contenido');
      }

      // Actualizar formData con el contenido generado
      setFormData(prev => ({
        ...prev,
        title: result.title || '',
        slug: result.slug || '',
        excerpt: result.excerpt || '',
        content: result.content || '',
        mainImage: result.mainImage || prev.mainImage,
        tags: result.tags || [],
        readingTime: result.readingTime || 0,
        seo: result.seo || prev.seo,
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando contenido');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Primero crear en la cola local
      const queueResponse = await fetch('/api/admin/content-creator/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const queueResult = await queueResponse.json();

      if (!queueResponse.ok) {
        throw new Error(queueResult.error || 'Error creating content in queue');
      }

      // Luego crear en Sanity si está configurado
      if (config?.isConfigured) {
        const sanityResult = await createContent({
          ...formData,
          queueItemId: queueResult.queueItem?.id
        });

        if (sanityResult.success) {
          setSanityResult(sanityResult);
          setSuccess(true);
          
          // Mostrar éxito por 2 segundos antes de cerrar
          setTimeout(() => {
            // Reset form
            setFormData({
              title: '',
              slug: '',
              excerpt: '',
              content: '',
              mainImage: { prompt: '', alt: '', caption: '' },
              tags: [],
              readingTime: 0,
              seo: { metaTitle: '', metaDescription: '', keywords: [] },
              type: 'blog',
              language: 'es',
              user_prompt: '',
            });
            setSuccess(false);
            setSanityResult(null);
            onSuccess();
            onClose();
          }, 2000);
        } else {
          throw new Error(sanityResult.error || 'Error creating content in Sanity');
        }
      } else {
        // Si Sanity no está configurado, solo crear en cola
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            mainImage: { prompt: '', alt: '', caption: '' },
            tags: [],
            readingTime: 0,
            seo: { metaTitle: '', metaDescription: '', keywords: [] },
            type: 'blog',
            language: 'es',
            user_prompt: '',
          });
          setSuccess(false);
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImageUrl(imageUrl);
    setIsImageGeneratorOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-apidevs-primary" />
            Crear Contenido
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Estado de Sanity */}
          {config && (
            <div className={`p-3 rounded-lg border ${
              config.isConfigured 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-yellow-900/20 border-yellow-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {config.isConfigured ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Upload className="h-4 w-4 text-yellow-400" />
                )}
                <span className={`text-sm ${
                  config.isConfigured ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  Sanity: {config.isConfigured ? 'Configurado' : 'No configurado'}
                </span>
              </div>
              {!config.isConfigured && (
                <p className="text-xs text-yellow-300 mt-1">
                  El contenido se creará solo en la cola local hasta que configures Sanity
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <p className="text-green-400 text-sm font-medium">¡Contenido creado exitosamente!</p>
              </div>
              {sanityResult && (
                <div className="text-xs text-green-300">
                  <p>Documento ID: {sanityResult.documentId}</p>
                  <p>Estado: {config?.isConfigured ? 'Creado en Sanity' : 'Creado en cola local'}</p>
                </div>
              )}
            </div>
          )}

          {/* GENERACIÓN AUTOMÁTICA CON IA */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-400" />
              Generación Automática con IA
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Contenido
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="blog">📝 Blog Post</option>
                  <option value="docs">📚 Documentación</option>
                  <option value="indicators">📊 Indicadores</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Idioma
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt para la IA ✨
              </label>
              <textarea
                name="user_prompt"
                value={formData.user_prompt}
                onChange={handleChange}
                placeholder="Ejemplo: Escribe un artículo sobre cómo usar MACD para identificar tendencias en el mercado..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                La IA generará automáticamente el título y el contenido completo
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !formData.user_prompt.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isGenerating ? 'Generando con IA...' : 'Generar con IA'}
              </button>
            </div>
          </div>

          {/* UI SEGMENTADA SEGÚN SCHEMA DE SANITY */}
          <div className="space-y-4">
            {/* SECCIÓN 1: Información Básica */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                📝 Información Básica {formData.title && '✅'}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Título (máx 150 caracteres) *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Se generará automáticamente..."
                    maxLength={150}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/150</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Slug URL *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-amigable"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Excerpt / Resumen (50-250 caracteres) *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Resumen corto para cards y preview..."
                  rows={2}
                  maxLength={250}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/250</p>
              </div>
            </div>

            {/* SECCIÓN 2: Contenido Principal + Imagen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Contenido */}
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3">📄 Contenido Principal {formData.content && '✅'}</h3>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Se generará automáticamente..."
                  rows={16}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 resize-none font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content ? `~${Math.ceil(formData.content.split(' ').length / 200)} min lectura` : 'Markdown soportado'}
                </p>
              </div>

              {/* Imagen Principal */}
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3">🖼️ Imagen Principal</h3>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Imagen (Opcional)
            </label>
            
            {generatedImageUrl ? (
              <div className="space-y-3">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated content image" 
                  className="w-full max-w-md mx-auto rounded-lg border border-white/10"
                />
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImageGeneratorOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generar Nueva Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneratedImageUrl(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Quitar Imagen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsImageGeneratorOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:from-purple-600/30 hover:to-blue-600/30 transition-all"
              >
                <Image className="h-5 w-5" />
                Generar Imagen con IA
              </button>
            )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Tags y Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tags */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">🏷️ Tags {formData.tags.length > 0 && '✅'}</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-apidevs-primary/20 text-apidevs-primary text-xs rounded-lg border border-apidevs-primary/30 flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }))}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mb-2">Tags: {formData.tags.length}/10</p>
            </div>

            {/* Tiempo de lectura */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">⏱️ Tiempo de Lectura</h3>
              <input
                type="number"
                value={formData.readingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, readingTime: parseInt(e.target.value) || 0 }))}
                placeholder="Minutos"
                min="1"
                max="60"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
              />
              <p className="text-xs text-gray-400 mt-1">Minutos estimados de lectura</p>
            </div>
          </div>

          {/* SECCIÓN 4: SEO */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">🚀 Optimización SEO {formData.seo.metaDescription && '✅'}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Meta Título (máx 60 caracteres)
                </label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaTitle: e.target.value } }))}
                  placeholder="Título SEO..."
                  maxLength={60}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.seo.metaTitle.length}/60</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Keywords SEO
                </label>
                <div className="flex flex-wrap gap-1">
                  {formData.seo.keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formData.seo.keywords.length} keywords</p>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Meta Descripción (máx 160 caracteres)
              </label>
              <textarea
                value={formData.seo.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaDescription: e.target.value } }))}
                placeholder="Meta descripción optimizada..."
                rows={2}
                maxLength={160}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.seo.metaDescription.length}/160</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSubmitting ? 'Creando...' : success ? '¡Creado!' : 'Crear Contenido'}
            </button>
          </div>
        </form>
      </div>

      {/* Generador de imágenes con Grok */}
      <GrokImageGenerator
        isOpen={isImageGeneratorOpen}
        onClose={() => setIsImageGeneratorOpen(false)}
        onImageGenerated={handleImageGenerated}
        contentTitle={formData.title}
        contentType={formData.type}
      />
    </div>
  );
}
