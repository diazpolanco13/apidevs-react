'use client';

import { X, FileText, Image as ImageIcon, Tag, Clock, CheckCircle } from 'lucide-react';

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export default function ContentPreviewModal({ isOpen, onClose, item }: ContentPreviewModalProps) {
  if (!isOpen || !item) return null;

  const generatedContent = item.generated_content || {};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-apidevs-primary" />
              Preview del Contenido
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {item.content_type} • {item.language} • {item.status}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <h4 className="text-sm font-bold text-apidevs-primary mb-3">📝 Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Título:</p>
                <p className="text-white font-medium">{item.title || 'Sin título'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Slug:</p>
                <p className="text-apidevs-primary font-mono text-sm">{generatedContent.slug || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Excerpt:</p>
                <p className="text-gray-300 text-sm italic">{generatedContent.excerpt || item.user_prompt}</p>
              </div>
            </div>
          </div>

          {/* Grid: Contenido + Imagen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contenido */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="text-sm font-bold text-apidevs-primary mb-3">📄 Contenido Principal</h4>
              <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                  {generatedContent.content || item.content || 'Sin contenido'}
                </pre>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {(generatedContent.content || item.content || '').split(' ').length} palabras
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {generatedContent.readingTime || 5} min lectura
                </span>
              </div>
            </div>

            {/* Imagen */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="text-sm font-bold text-apidevs-primary mb-3">🖼️ Imagen Principal</h4>
              {generatedContent.mainImage || item.generated_images?.[0] ? (
                <div className="space-y-3">
                  {item.generated_images?.[0]?.url && (
                    <img 
                      src={item.generated_images[0].url} 
                      alt={generatedContent.mainImage?.alt || 'Generated image'}
                      className="w-full rounded-lg border border-purple-500/30"
                    />
                  )}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <p className="text-xs text-purple-400 font-bold mb-2">Metadatos:</p>
                    <p className="text-xs text-gray-300">
                      <span className="text-gray-400">Alt:</span> {generatedContent.mainImage?.alt || 'N/A'}
                    </p>
                    {generatedContent.mainImage?.caption && (
                      <p className="text-xs text-gray-300 mt-1">
                        <span className="text-gray-400">Caption:</span> {generatedContent.mainImage.caption}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin imagen</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags y Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tags */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="text-sm font-bold text-apidevs-primary mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h4>
              {generatedContent.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {generatedContent.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-apidevs-primary/20 text-apidevs-primary text-xs rounded-lg border border-apidevs-primary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Sin tags</p>
              )}
            </div>

            {/* Estadísticas */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="text-sm font-bold text-apidevs-primary mb-3">📊 Estadísticas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tokens usados:</span>
                  <span className="text-white font-mono">{item.tokens_used || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiempo de lectura:</span>
                  <span className="text-white">{generatedContent.readingTime || 5} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Creado:</span>
                  <span className="text-white text-xs">{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Optimización SEO
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Meta Título:</p>
                <p className="text-white">{generatedContent.seo?.metaTitle || 'No definido'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Meta Descripción:</p>
                <p className="text-gray-300">{generatedContent.seo?.metaDescription || 'No definido'}</p>
              </div>
              {generatedContent.seo?.keywords?.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-400 mb-2">Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedContent.seo.keywords.map((keyword: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Completo */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <h4 className="text-sm font-bold text-green-400 mb-3">💻 JSON para Sanity</h4>
            <div className="bg-black rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
                {JSON.stringify(generatedContent, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-700 sticky bottom-0 bg-gray-900">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

