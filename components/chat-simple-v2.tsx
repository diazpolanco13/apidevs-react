"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Plus, Trash2, Send, Sparkles, Menu, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
  message_count?: number;
}

export function ChatSimpleV2() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar historial de conversaciones
  const loadConversations = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Contar mensajes
      const conversationsWithCount = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          return { ...conv, message_count: count || 0 };
        })
      );

      setConversations(conversationsWithCount);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Cargar mensajes de conversación
  const loadConversationMessages = async (convId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, parts, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = (data || []).map(msg => ({
        id: msg.created_at || Date.now().toString(),
        role: msg.role as 'user' | 'assistant',
        content: typeof msg.parts === 'object' && msg.parts !== null && 'content' in msg.parts
          ? String((msg.parts as any).content)
          : ''
      }));

      setMessages(formattedMessages);
      setCurrentConversationId(convId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Nueva conversación
  const newConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  // Eliminar conversación
  const deleteConversation = async (convId: string) => {
    if (!confirm('¿Eliminar esta conversación?')) return;

    try {
      const supabase = createClient();
      await supabase.from('chat_messages').delete().eq('conversation_id', convId);
      await supabase.from('chat_conversations').delete().eq('id', convId);
      
      if (currentConversationId === convId) {
        newConversation();
      }
      loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta");
      }

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      }]);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo leer la respuesta");
      }

      let fullResponse = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        fullResponse += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
      }

      // Recargar conversaciones después de completar
      setTimeout(() => loadConversations(), 1000);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Lo siento, hubo un error. Por favor intenta de nuevo.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#1a1a1a]">
      {/* Sidebar - Historial */}
      <div className={`${sidebarOpen ? 'w-full sm:w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-800 bg-[#0f0f0f] flex flex-col ${sidebarOpen ? 'fixed sm:relative inset-0 z-50 sm:z-auto' : ''}`}>
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9D92E] to-[#A5B125] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">Charti</h2>
                <p className="text-gray-500 text-xs">v1.0</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-white" />
            </button>
          </div>
          
          <button
            onClick={newConversation}
            className="w-full px-4 py-2.5 bg-[#C9D92E] hover:bg-[#B8C428] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9D92E]/20"
          >
            <Plus className="w-4 h-4" />
            Nueva conversación
          </button>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Sin conversaciones
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversationMessages(conv.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conv.id
                    ? 'bg-gray-800 border border-[#C9D92E]/30'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate mb-1">
                      {conv.title || 'Nueva conversación'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MessageSquare className="w-3 h-3" />
                      <span>{conv.message_count || 0} msgs</span>
                      <span>•</span>
                      <span>
                        {conv.updated_at
                          ? new Date(conv.updated_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short'
                            })
                          : 'Hoy'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-600 rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Botón toggle sidebar flotante */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-6 right-4 z-10 p-3 bg-gray-800/90 hover:bg-gray-700 backdrop-blur-sm rounded-xl transition-all shadow-xl border border-gray-700 hover:border-[#C9D92E]/50"
            title="Mostrar historial"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 shadow-2xl shadow-[#C9D92E]/20 bg-[#C9D92E]">
                <img 
                  src="https://zzieiqxlxfydvexalbsr.supabase.co/storage/v1/object/public/static-assets/animations/buho-leyendo.webp"
                  alt="Charti"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">¡Hola! Soy Charti</h2>
              <p className="text-gray-400 max-w-md mb-8">
                Tu asistente virtual de APIDevs. Pregúntame sobre planes, indicadores, tu cuenta o cualquier duda técnica.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                <button
                  onClick={() => setInput("¿Qué planes tienen disponibles?")}
                  className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#C9D92E]/50 rounded-xl text-left transition-all group"
                >
                  <p className="text-white font-medium text-sm sm:text-base mb-1 group-hover:text-[#C9D92E]">Planes disponibles</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Ver opciones de suscripción</p>
                </button>
                <button
                  onClick={() => setInput("¿Qué indicadores tengo activos?")}
                  className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#C9D92E]/50 rounded-xl text-left transition-all group"
                >
                  <p className="text-white font-medium text-sm sm:text-base mb-1 group-hover:text-[#C9D92E]">Mis indicadores</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Ver accesos activos</p>
                </button>
                <button
                  onClick={() => setInput("¿Cómo activo un indicador en TradingView?")}
                  className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#C9D92E]/50 rounded-xl text-left transition-all group"
                >
                  <p className="text-white font-medium text-sm sm:text-base mb-1 group-hover:text-[#C9D92E]">Activar indicador</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Guía de activación</p>
                </button>
                <button
                  onClick={() => setInput("¿Tengo descuentos como cliente legacy?")}
                  className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#C9D92E]/50 rounded-xl text-left transition-all group"
                >
                  <p className="text-white font-medium text-sm sm:text-base mb-1 group-hover:text-[#C9D92E]">Descuentos legacy</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Beneficios especiales</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto px-2 sm:px-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-gray-700"
                        : "bg-gradient-to-br from-[#C9D92E] to-[#A5B125] shadow-lg shadow-[#C9D92E]/20"
                    }`}>
                      {msg.role === "user" ? (
                        <span className="text-white text-sm font-bold">TÚ</span>
                      ) : (
                        <Sparkles className="w-4 h-4 text-black" />
                      )}
                    </div>
                    
                    {/* Message */}
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-800/50 text-gray-100 border border-gray-700"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Estilo Gemini */}
        <div className="border-t border-gray-800 bg-[#0f0f0f] p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-expand como Gemini (sin scroll)
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Pregúntale a Charti..."
                disabled={isLoading}
                rows={1}
                className="w-full pl-6 pr-14 py-4 bg-gray-800 border border-gray-700 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9D92E] focus:border-transparent disabled:opacity-50 text-base resize-none overflow-hidden"
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#C9D92E] hover:bg-[#B8C428] text-black rounded-full transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#C9D92E]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
