"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChatAuth } from "./chat-auth";

// Estilos CSS para scrollbar personalizada (solo WebKit)
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #C9D92E 0%, #B8C428 100%);
    border-radius: 10px;
    border: 2px solid #2a2a2a;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #B8C428 0%, #A5B125 100%);
  }
`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UserData {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_status?: string;
  subscription_tier?: string;
  customer_tier?: string | null;
  // 🚀 Nuevos campos para legacy
  is_legacy_user?: boolean | null;
  legacy_customer?: boolean | null;
  legacy_discount_percentage?: number | null;
  legacy_benefits?: any;
  legacy_customer_type?: string | null;
  legacy_lifetime_spent?: number | null;
  legacy_purchase_count?: number | null;
  has_legacy_discount_eligible?: boolean;
}

// Función para determinar el indicador de carga apropiado
function getLoadingIndicator(messages: Message[], userData: UserData | null): string {
  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();

  if (!lastUserMessage) return "🤔 Pensando...";

  const content = lastUserMessage.content.toLowerCase();

  // Detectar consultas sobre indicadores/accesos
  if (content.includes('indicador') || content.includes('acceso') || content.includes('usuario') ||
      content.includes('tradingview') || content.includes('cuántos') || content.includes('tiene')) {
    return "🔍 Consultando base de datos...";
  }

  // Detectar consultas administrativas (solo para admin)
  if (userData?.email === 'api@apidevs.io' &&
      (content.includes('muestra') || content.includes('lista') || content.includes('todos'))) {
    return "📊 Procesando datos administrativos...";
  }

  // Detectar consultas sobre precios/planes
  if (content.includes('precio') || content.includes('cuesta') || content.includes('plan') ||
      content.includes('suscripción') || content.includes('pago')) {
    return "💰 Calculando precios...";
  }

  // Detectar consultas técnicas/soporte
  if (content.includes('ayuda') || content.includes('problema') || content.includes('error') ||
      content.includes('cómo') || content.includes('no funciona')) {
    return "🔧 Procesando consulta técnica...";
  }

  // Default
  return "🤔 Generando respuesta inteligente...";
}

// Componente ContextualSuggestions eliminado por solicitud del usuario

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [showAuth, setShowAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Inyectar estilos CSS personalizados para scrollbar
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customScrollbarStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Verificar autenticación al abrir el chat
  useEffect(() => {
    if (isOpen && !authChecked) {
      checkAuthStatus();
    }
  }, [isOpen, authChecked]);

  // Auto-scroll cuando llegan nuevos mensajes o cuando está cargando
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      // Usar setTimeout para asegurar que el DOM se haya actualizado
      setTimeout(() => scrollToBottom(), 50);
    }
  }, [messages, isLoading]);

  // Scroll al abrir el chat
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen]);

  // Función para hacer scroll automático al final
  const scrollToBottom = () => {
    // Si el bot está escribiendo (isLoading), siempre hacer scroll automático
    // Si no está escribiendo, solo hacer scroll si el usuario está cerca del final
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      // Forzar scroll si está cargando (bot escribiendo) o si está cerca del final
      if (isLoading || isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const checkAuthStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Usuario logueado, obtener sus datos
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && userData) {
        setUserData(userData);
        addWelcomeMessage(userData);
      }
    } else {
      // Usuario no logueado, mostrar formulario de email
      setShowAuth(true);
    }
    
    setAuthChecked(true);
  };

  const addWelcomeMessage = async (user: UserData) => {
    // 🤖 Generar saludo personalizado usando la IA
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: "hola"
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      // Crear mensaje vacío del asistente
      const assistantMessageId = Date.now().toString();
      setMessages([{
        id: assistantMessageId,
        role: "assistant",
        content: "",
      }]);

      // Leer la respuesta como stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo leer la respuesta");
      }

      let fullResponse = "";
      let chunkCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`✅ Saludo generado. Total chunks: ${chunkCount}, Longitud: ${fullResponse.length}`);
          break;
        }

        const chunk = new TextDecoder().decode(value);
        fullResponse += chunk;
        chunkCount++;

        // Actualizar el mensaje en tiempo real
        setMessages([{
          id: assistantMessageId,
          role: "assistant",
          content: fullResponse,
        }]);
        
        // Scroll automático
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }

    } catch (error) {
      console.error("Error generando saludo:", error);
      // Fallback a mensaje simple si falla la IA
      const userName = user.full_name || user.email || 'Usuario';
      setMessages([{
        id: Date.now().toString(),
        role: "assistant",
        content: `¡Hola ${userName}! 👋\n\nSoy tu asistente de APIDevs. ¿En qué puedo ayudarte?`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData: UserData) => {
    setUserData(userData);
    setShowAuth(false);
    addWelcomeMessage(userData);
  };

  const handleGuestContinue = (email: string) => {
    setGuestEmail(email);
    setShowAuth(false);
    setMessages([{
      id: Date.now().toString(),
      role: "assistant",
      content: `¡Hola! 👋 

Soy tu asistente de APIDevs. Puedo ayudarte con información general sobre nuestros planes e indicadores.

${email ? `Email registrado: ${email}` : 'Modo invitado activado'}

¿En qué puedo ayudarte?`,
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Si no está autenticado y no tiene email, mostrar auth
    if (!userData && !guestEmail) {
      setShowAuth(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Crear timeout de 60 segundos para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.details || errorData.error || `Error HTTP ${response.status}`);
      }

      // Crear mensaje vacío del asistente
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      }]);

      // Leer la respuesta como texto plano
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo leer la respuesta");
      }

      let fullResponse = "";
      let chunkCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`✅ Stream finalizado. Total chunks: ${chunkCount}, Longitud: ${fullResponse.length}`);
          break;
        }

        const chunk = new TextDecoder().decode(value);
        chunkCount++;
        
        // Log cada 10 chunks para no saturar la consola
        if (chunkCount % 10 === 0) {
          console.log(`📦 Chunk ${chunkCount}: ${chunk.substring(0, 50)}...`);
        }
        
        // Agregar el chunk directamente al mensaje
        fullResponse += chunk;
        
        // Actualizar el mensaje en tiempo real
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
        
        // Forzar scroll al final mientras recibe el stream
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
      
      console.log(`📝 Respuesta completa recibida (${fullResponse.length} caracteres)`);
      console.log(`🔍 Primeros 200 caracteres: ${fullResponse.substring(0, 200)}`);

    } catch (error: any) {
      console.error("❌ Error en handleSubmit:", error);
      
      let errorMessage = "Error desconocido";
      
      if (error?.name === 'AbortError') {
        errorMessage = "⏱️ La respuesta está tardando demasiado. El servidor puede estar procesando una consulta compleja. Por favor intenta:\n\n1. Reformular tu pregunta de forma más específica\n2. Esperar unos segundos y volver a intentar\n3. Contactar a soporte si el problema persiste";
      } else {
        errorMessage = error?.message || "Error desconocido";
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `❌ Lo siento, hubo un error al procesar tu mensaje:\n\n${errorMessage}\n\nPor favor intenta de nuevo o contacta a soporte si el problema persiste.`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante con GIF */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group transition-all duration-300 hover:scale-105"
        >
          {/* GIF animado optimizado (WebP desde Supabase CDN con fallback a GIF) */}
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-[#aaff00] bg-black hover:border-[#C9D92E] transition-colors duration-300">
            <picture>
              <source srcSet="https://zzieiqxlxfydvexalbsr.supabase.co/storage/v1/object/public/static-assets/animations/chatbot-boton.webp" type="image/webp" />
              <img 
                src="/chatbot-boton.gif" 
                alt="Chat APIDevs" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback si el GIF no carga
                  const target = e.currentTarget;
                  const sibling = target.nextElementSibling as HTMLElement | null;
                  if (target && sibling) {
                    target.style.display = 'none';
                    sibling.style.display = 'flex';
                  }
                }}
              />
            </picture>
            {/* Fallback icon si el GIF no carga */}
            <div className="w-full h-full bg-[#aaff00] text-black flex items-center justify-center" style={{display: 'none'}}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          
          {/* Badge de notificación (opcional) */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#aaff00] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
            </div>
          )}
          
          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              ¡Hola! Soy Charti, tu asistente de APIDEVs.
              <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          )}
        </button>
      </div>

      {/* Widget de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-2 z-50 w-96 h-[500px] bg-[#1a1a1a] rounded-lg shadow-2xl border border-[#333] flex flex-col backdrop-blur-sm">
          {/* Header */}
          <div className="bg-[#C9D92E] text-black p-4 rounded-t-lg flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              {/* GIF del búho leyendo */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                <img 
                  src="/buho-leyendo.gif" 
                  alt="Búho APIDevs" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si el GIF no carga
                    const target = e.currentTarget;
                    const sibling = target.nextElementSibling as HTMLElement | null;
                    if (target && sibling) {
                      target.style.display = 'none';
                      sibling.style.display = 'flex';
                    }
                  }}
                />
                {/* Fallback emoji si el GIF no carga */}
                <div className="w-full h-full bg-white/20 text-black flex items-center justify-center text-lg" style={{display: 'none'}}>
                  🦉
                </div>
              </div>
              <div>
                <h3 className="font-bold text-black">Asistente APIDevs</h3>
                <p className="text-xs text-black/80 font-medium">¿En qué puedo ayudarte?</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                // Reset auth state when closing
                setAuthChecked(false);
                setShowAuth(false);
                setMessages([]);
              }}
              className="text-black hover:text-black/70 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-[#1a1a1a] space-y-3 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#C9D92E #2a2a2a'
            }}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-300 text-sm">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#aaff00]/20 flex items-center justify-center">
                    <img 
                      src="/buho-leyendo.gif" 
                      alt="Búho APIDevs" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-white font-medium">¡Hola! Soy tu asistente de APIDevs.</p>
                <p className="mt-2 text-gray-400">Puedo ayudarte con:</p>
                <ul className="text-xs mt-2 space-y-1 text-[#aaff00]">
                  <li>• Planes y precios</li>
                  <li>• Indicadores disponibles</li>
                  <li>• Información de tu cuenta</li>
                  <li>• Soporte general</li>
                </ul>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-[#C9D92E] text-black font-medium"
                      : "bg-[#2a2a2a] text-white border border-[#333]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Elemento invisible para hacer scroll automático */}
            <div ref={messagesEndRef} />
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] text-[#aaff00] border border-[#333] px-3 py-2 rounded-lg">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <span className="animate-spin">⚡</span>
                    {getLoadingIndicator(messages, userData)}
                  </p>
                </div>
              </div>
            )}

            {/* Sugerencias contextuales eliminadas */}
          </div>

          {/* Input o Auth */}
          {showAuth ? (
            <ChatAuth 
              onAuthSuccess={handleAuthSuccess}
              onGuestContinue={handleGuestContinue}
            />
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-[#1a1a1a] border-t border-[#333]">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize el textarea según el contenido
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    // Enviar con Enter, nueva línea con Shift+Enter
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && input.trim()) {
                        handleSubmit(e as any);
                      }
                    }
                  }}
                  placeholder="Escribe tu pregunta..."
                  rows={1}
                  className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aaff00] focus:border-[#aaff00] text-white placeholder-gray-400 text-sm resize-none overflow-y-auto transition-all duration-200 custom-scrollbar"
                  style={{ 
                    minHeight: '40px', 
                    maxHeight: '120px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#C9D92E #2a2a2a'
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-[#C9D92E] text-black rounded-lg hover:bg-[#B8C428] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-bold shadow-md hover:shadow-xl hover:scale-105 flex-shrink-0"
                >
                  {isLoading ? "..." : "Enviar"}
                </button>
              </div>
              {userData && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-400">
                    Conectado como: <span className="text-[#aaff00]">{userData.full_name || userData.email}</span>
                  </p>
                </div>
              )}
              {guestEmail && !userData && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-400">
                    Modo invitado: <span className="text-[#aaff00]">{guestEmail}</span>
                    <button 
                      onClick={() => setShowAuth(true)}
                      className="ml-2 text-[#aaff00] hover:text-[#C9D92E] underline"
                    >
                      cambiar
                    </button>
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default ChatWidget;
