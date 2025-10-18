'use client';

import { useState } from 'react';
import { Image, Wand2, Download, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useGrokImageGeneration } from '@/hooks/useGrokImageGeneration';

interface GrokImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (imageUrl: string) => void;
  contentTitle?: string;
  contentType?: 'blog' | 'docs' | 'indicators';
}

export default function GrokImageGenerator({ 
  isOpen, 
  onClose, 
  onImageGenerated, 
  contentTitle = '',
  contentType = 'blog'
}: GrokImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'realistic' | 'artistic' | 'cartoon' | 'abstract'>('realistic');
  const [size, setSize] = useState<'1024x1024' | '1024x1792' | '1792x1024'>('1024x1024');
  const [quality, setQuality] = useState<'standard' | 'hd'>('hd');
  
  const { generating, lastResult, generateImage, generateImageForContent, clearLastResult } = useGrokImageGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Por favor ingresa un prompt para la imagen');
      return;
    }

    const result = await generateImage({
      prompt,
      style,
      size,
      quality
    });

    if (result.success && result.imageUrl) {
      onImageGenerated(result.imageUrl);
    }
  };

  const handleAutoGenerate = async () => {
    if (!contentTitle.trim()) {
      alert('Se necesita un título para generar automáticamente');
      return;
    }

    const result = await generateImageForContent(contentTitle, contentType, style);

    if (result.success && result.imageUrl) {
      onImageGenerated(result.imageUrl);
    }
  };

  const handleDownload = () => {
    if (lastResult?.imageUrl) {
      const link = document.createElement('a');
      link.href = lastResult.imageUrl;
      link.download = `grok-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    clearLastResult();
    setPrompt('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-apidevs-primary" />
            Generador de Imágenes con IA
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resultado de la generación */}
          {lastResult && (
            <div className={`p-4 rounded-lg border ${
              lastResult.success 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-red-900/20 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {lastResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  lastResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastResult.success ? 'Imagen generada exitosamente' : 'Error al generar imagen'}
                </span>
              </div>
              
              {lastResult.success && lastResult.imageUrl && (
                <div className="space-y-3">
                  <img 
                    src={lastResult.imageUrl} 
                    alt="Generated image" 
                    className="w-full max-w-md mx-auto rounded-lg border border-white/10"
                  />
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </button>
                    <button
                      onClick={() => onImageGenerated(lastResult.imageUrl!)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Usar Imagen
                    </button>
                  </div>
                </div>
              )}
              
              {!lastResult.success && (
                <p className="text-red-300 text-sm">{lastResult.error}</p>
              )}
            </div>
          )}

          {/* Generación automática */}
          {contentTitle && (
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Image className="h-5 w-5 text-purple-400" />
                Generación Automática
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Genera una imagen automáticamente basada en el título: <strong>"{contentTitle}"</strong>
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="realistic">Realista</option>
                  <option value="artistic">Artístico</option>
                  <option value="cartoon">Caricatura</option>
                  <option value="abstract">Abstracto</option>
                </select>
                <button
                  onClick={handleAutoGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {generating ? 'Generando...' : 'Generar Automáticamente'}
                </button>
              </div>
            </div>
          )}

          {/* Generación manual */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-apidevs-primary" />
              Generación Manual
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt para la imagen
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe la imagen que quieres generar..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estilo
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                >
                  <option value="realistic">Realista</option>
                  <option value="artistic">Artístico</option>
                  <option value="cartoon">Caricatura</option>
                  <option value="abstract">Abstracto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tamaño
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                >
                  <option value="1024x1024">1024x1024 (Cuadrado)</option>
                  <option value="1024x1792">1024x1792 (Vertical)</option>
                  <option value="1792x1024">1792x1024 (Horizontal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Calidad
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                >
                  <option value="standard">Estándar</option>
                  <option value="hd">Alta Definición</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {generating ? 'Generando...' : 'Generar Imagen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
