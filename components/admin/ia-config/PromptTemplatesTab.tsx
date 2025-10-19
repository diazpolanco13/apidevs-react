'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface PromptTemplate {
  id: string;
  template_key: string;
  template_name: string;
  template_description: string;
  prompt_content: string;
  category: 'prompt_engineering' | 'content_generation' | 'image_generation';
  is_active: boolean;
}

export default function PromptTemplatesTab() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function startEditing(template: PromptTemplate) {
    setEditingId(template.id);
    setEditedContent(template.prompt_content);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditedContent('');
  }

  async function saveTemplate(id: string) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('ai_prompt_templates')
        .update({
          prompt_content: editedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, prompt_content: editedContent } : t
      ));

      setEditingId(null);
      setEditedContent('');
      
      alert('✅ Template guardado exitosamente');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('❌ Error al guardar el template');
    } finally {
      setSaving(false);
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prompt_engineering': return '✨';
      case 'content_generation': return '📝';
      case 'image_generation': return '🎨';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prompt_engineering': return 'from-amber-500/20 to-orange-500/10 border-amber-500/30';
      case 'content_generation': return 'from-blue-500/20 to-cyan-500/10 border-blue-500/30';
      case 'image_generation': return 'from-purple-500/20 to-pink-500/10 border-purple-500/30';
      default: return 'from-gray-500/20 to-gray-500/10 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-apidevs-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Cargando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">📋</span>
            Templates de Prompts
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Edita los mega-prompts que controlan cómo se genera el contenido
          </p>
        </div>
        
        <button
          onClick={loadTemplates}
          className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Recargar
        </button>
      </div>

      {/* Lista de Templates */}
      <div className="space-y-6">
        {templates.map((template) => {
          const isEditing = editingId === template.id;
          const categoryColor = getCategoryColor(template.category);
          const categoryIcon = getCategoryIcon(template.category);

          return (
            <div
              key={template.id}
              className={`bg-gradient-to-r ${categoryColor} backdrop-blur-sm rounded-xl p-6 border`}
            >
              {/* Header del Template */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{categoryIcon}</span>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {template.template_name}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono">
                        {template.template_key}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {template.template_description}
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => startEditing(template)}
                      className="px-4 py-2 bg-apidevs-primary hover:bg-apidevs-primary-dark text-gray-900 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={cancelEditing}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveTemplate(template.id)}
                        disabled={saving || editedContent === template.prompt_content}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardar
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Contenido del Prompt */}
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-white">
                      Contenido del Prompt
                    </label>
                    <span className="text-xs text-gray-400">
                      {editedContent.length} caracteres
                    </span>
                  </div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-apidevs-primary transition-colors resize-y"
                    placeholder="Escribe el mega-prompt aquí..."
                  />
                  
                  {/* Variables disponibles */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Variables Disponibles
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {template.category === 'prompt_engineering' && (
                        <>
                          <code className="px-2 py-1 bg-gray-800 text-apidevs-primary rounded text-xs">
                            {'{'}{'{'} userPrompt {'}'}{'}'}
                          </code>
                          <code className="px-2 py-1 bg-gray-800 text-apidevs-primary rounded text-xs">
                            {'{'}{'{'} language {'}'}{'}'}
                          </code>
                        </>
                      )}
                      {template.category === 'content_generation' && (
                        <>
                          <code className="px-2 py-1 bg-gray-800 text-apidevs-primary rounded text-xs">
                            {'{'}{'{'} typePrompt {'}'}{'}'}
                          </code>
                        </>
                      )}
                      {template.category === 'image_generation' && (
                        <>
                          <code className="px-2 py-1 bg-gray-800 text-apidevs-primary rounded text-xs">
                            {'{'}{'{'} articleData {'}'}{'}'}
                          </code>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                    {template.prompt_content}
                  </pre>
                </div>
              )}

              {/* Footer con info */}
              <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Categoría: <span className="text-gray-400">{template.category}</span></span>
                  <span className={`px-2 py-1 rounded ${template.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {template.is_active ? '✅ Activo' : '⚠️ Inactivo'}
                  </span>
                </div>
                <span>ID: {template.template_key}</span>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No hay templates disponibles</p>
          <p className="text-sm mt-2">Los templates se crearán automáticamente en la primera ejecución</p>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C9D92E;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B8C428;
        }
      `}</style>
    </div>
  );
}

