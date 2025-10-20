'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Download, Eye, Trash2, Calendar, User, MessageCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Conversation {
  id: string;
  user_id: string | null;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
  message_count?: number;
  user_email?: string;
  user_name?: string;
}

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

export default function ConversacionesTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Cargar conversaciones
  const loadConversations = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Obtener conversaciones con información del usuario
      const { data: convData, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          user_id,
          title,
          created_at,
          updated_at,
          users (
            email,
            full_name
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Contar mensajes por conversación
      const conversationsWithCount = await Promise.all(
        (convData || []).map(async (conv: any) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          return {
            id: conv.id,
            user_id: conv.user_id,
            title: conv.title,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            message_count: count || 0,
            user_email: conv.users?.email || 'Usuario eliminado',
            user_name: conv.users?.full_name || 'Usuario eliminado'
          };
        })
      );

      setConversations(conversationsWithCount);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes de una conversación
  const loadMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, parts, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = (data || []).map(msg => ({
        role: msg.role,
        content: typeof msg.parts === 'object' && msg.parts !== null && 'content' in msg.parts
          ? String((msg.parts as any).content)
          : '',
        timestamp: msg.created_at || undefined
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Eliminar conversación
  const deleteConversation = async (conversationId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta conversación?')) return;

    try {
      const supabase = createClient();
      
      // Eliminar mensajes
      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Eliminar conversación
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Recargar lista
      loadConversations();
      
      // Si era la seleccionada, cerrar modal
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error al eliminar la conversación');
    }
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(['ID', 'Usuario', 'Email', 'Título', 'Mensajes', 'Creada', 'Actualizada'].join(','));

    conversations.forEach(conv => {
      const row = [
        conv.id,
        conv.user_name || '',
        conv.user_email || '',
        conv.title || '',
        conv.message_count || 0,
        conv.created_at || '',
        conv.updated_at || ''
      ];
      csvRows.push(row.map(val => `"${val}"`).join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversaciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv =>
    searchQuery === '' ||
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Historial de Conversaciones</h2>
          <p className="text-gray-400 text-sm">
            {conversations.length} conversaciones • {conversations.reduce((acc, c) => acc + (c.message_count || 0), 0)} mensajes totales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={exportToCSV}
            disabled={conversations.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, email o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      {loading ? (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-4">Cargando conversaciones...</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-700/30 border border-gray-600 mb-4">
            <MessageSquare className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery ? 'No se encontraron conversaciones' : 'Sin conversaciones aún'}
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda'
              : 'Las conversaciones del chatbot aparecerán aquí una vez que los usuarios empiecen a interactuar.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Mensajes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Última actividad
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredConversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{conv.user_name}</p>
                        <p className="text-gray-400 text-sm">{conv.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm line-clamp-2">{conv.title || 'Sin título'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-medium">{conv.message_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {conv.updated_at 
                          ? new Date(conv.updated_at).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedConversation(conv);
                          loadMessages(conv.id);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Ver conversación"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteConversation(conv.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Eliminar conversación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de conversación */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedConversation.title || 'Sin título'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{selectedConversation.user_name}</span>
                      <span className="text-gray-600">•</span>
                      <span>{selectedConversation.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{selectedConversation.message_count} mensajes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {selectedConversation.created_at
                          ? new Date(selectedConversation.created_at).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No hay mensajes en esta conversación
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold opacity-80">
                          {msg.role === 'user' ? 'Usuario' : 'Asistente'}
                        </span>
                        {msg.timestamp && (
                          <>
                            <span className="text-xs opacity-50">•</span>
                            <span className="text-xs opacity-60">
                              {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-4 border-t border-white/10 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Conversación iniciada el {selectedConversation.created_at
                    ? new Date(selectedConversation.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </p>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
