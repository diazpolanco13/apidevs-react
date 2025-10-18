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
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sanityResult, setSanityResult] = useState<any>(null);
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { createContent, config, loading: sanityLoading } = useSanityIntegration();

  const handleImprovePrompt = async () => {
    if (!formData.user_prompt.trim()) {
      setError('Por favor ingresa un prompt para mejorar');
      return;
    }

    setIsImprovingPrompt(true);
    setError('');

    try {
      const response = await fetch('/api/admin/content-creator/improve-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: formData.user_prompt,
          language: formData.language,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error mejorando prompt');
      }

      // Actualizar el prompt con la versión mejorada
      setFormData(prev => ({
        ...prev,
        user_prompt: result.improvedPrompt
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error mejorando prompt');
    } finally {
      setIsImprovingPrompt(false);
    }
  };

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

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleImprovePrompt}
                disabled={isImprovingPrompt || !formData.user_prompt.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {isImprovingPrompt ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isImprovingPrompt ? 'Mejorando...' : '✨ Mejorar Prompt'}
              </button>
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

          {/* VISTA RESUMIDA DEL CONTENIDO GENERADO */}
          {formData.title && (
            <div className="bg-gradient-to-br from-green-800/20 to-blue-800/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  ✅ Contenido Generado Exitosamente
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                >
                  👁️ Preview Completo
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Título:</p>
                  <p className="text-white font-medium truncate">{formData.title}</p>
                </div>
                <div>
                  <p className="text-gray-400">Tags:</p>
                  <p className="text-white">{formData.tags.length} etiquetas</p>
                </div>
                <div>
                  <p className="text-gray-400">Lectura:</p>
                  <p className="text-white">{formData.readingTime} min</p>
                </div>
                <div>
                  <p className="text-gray-400">Excerpt:</p>
                  <p className="text-white truncate">{formData.excerpt.substring(0, 50)}...</p>
                </div>
                <div>
                  <p className="text-gray-400">SEO Keywords:</p>
                  <p className="text-white">{formData.seo.keywords.length} keywords</p>
                </div>
                <div>
                  <p className="text-gray-400">Contenido:</p>
                  <p className="text-white">{formData.content.split(' ').length} palabras</p>
                </div>
              </div>
            </div>
          )}

          {/* GRID 2 COLUMNAS: Contenido + Imagen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contenido Principal */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">📄 Contenido Markdown {formData.content && '✅'}</h3>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Se generará automáticamente..."
                rows={12}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 resize-none font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content ? `~${formData.content.split(' ').length} palabras` : 'Markdown soportado'}
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

      {/* MODAL DE PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">👁️ Preview del Contenido Generado</h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Título:</p>
                  <p className="text-lg text-white font-bold">{formData.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Slug:</p>
                  <p className="text-sm text-apidevs-primary font-mono">{formData.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Excerpt:</p>
                  <p className="text-sm text-gray-300 italic">{formData.excerpt}</p>
                </div>
              </div>

              {/* Tags */}
              {formData.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-apidevs-primary/20 text-apidevs-primary text-sm rounded-lg border border-apidevs-primary/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm font-bold text-blue-400 mb-3">🚀 SEO</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Meta Título:</p>
                    <p className="text-white">{formData.seo.metaTitle || 'No definido'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Meta Descripción:</p>
                    <p className="text-gray-300">{formData.seo.metaDescription || 'No definido'}</p>
                  </div>
                  {formData.seo.keywords.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.seo.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido Principal */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Contenido Principal:</p>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{formData.content}</pre>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  📊 {formData.content.split(' ').length} palabras • ⏱️ {formData.readingTime} min lectura
                </p>
              </div>

              {/* JSON Completo */}
              <div>
                <p className="text-xs text-gray-400 mb-2">JSON para Sanity:</p>
                <div className="bg-black border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
                    {JSON.stringify({
                      title: formData.title,
                      slug: formData.slug,
                      excerpt: formData.excerpt,
                      content: formData.content,
                      mainImage: formData.mainImage,
                      tags: formData.tags,
                      readingTime: formData.readingTime,
                      seo: formData.seo
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cerrar Preview
              </button>
            </div>
          </div>
        </div>
      )}

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
