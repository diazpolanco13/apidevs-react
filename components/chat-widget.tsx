"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChatAuth } from "./chat-auth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
  subscription_status?: string;
  subscription_tier?: string;
  // 🚀 Nuevos campos para legacy
  is_legacy_user?: boolean;
  legacy_customer?: boolean;
  legacy_discount_percentage?: number;
  legacy_benefits?: any;
  legacy_customer_type?: string;
  legacy_lifetime_spent?: number;
  legacy_purchase_count?: number;
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

// Componente para sugerencias contextuales
interface ContextualSuggestionsProps {
  userData: UserData | null;
  messages: Message[];
  onSuggestionClick: (suggestion: string) => void;
}

function ContextualSuggestions({ userData, messages, onSuggestionClick }: ContextualSuggestionsProps) {
  // Verificar explícitamente que userData existe y es admin
  const isAdmin = userData && userData.email === 'api@apidevs.io';
  const isLegacyUser = userData && (userData.has_legacy_discount_eligible ||
                                  userData.is_legacy_user ||
                                  userData.legacy_customer ||
                                  (userData.legacy_discount_percentage || 0) > 0);

  if (!userData) return null; // No mostrar sugerencias si no hay datos del usuario

  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();

  if (!lastUserMessage) return null;

  const content = lastUserMessage.content.toLowerCase();

  // 🚀 Sugerencias especiales para usuarios LEGACY preguntando precios
  if (isLegacyUser && (content.includes('cuánto cuesta') || content.includes('precio') || content.includes('plan'))) {
    return (
      <div className="flex flex-wrap gap-2 mt-3 px-2">
        <SuggestionButton
          text="¿Cuánto descuento tengo?"
          onClick={() => onSuggestionClick("¿Cuánto descuento tengo como cliente legacy?")}
          special={true}
        />
        <SuggestionButton
          text="¿Precio con descuento?"
          onClick={() => onSuggestionClick("¿Cuál sería el precio con mi descuento legacy?")}
        />
        <SuggestionButton
          text="¡Suscríbeme con descuento!"
          onClick={() => onSuggestionClick("Quiero suscribirme al plan PRO con mi descuento legacy")}
        />
      </div>
    );
  }

  // Sugerencias para consultas sobre precios (usuarios normales)
  if (content.includes('cuánto cuesta') || content.includes('precio') || content.includes('plan')) {
    return (
      <div className="flex flex-wrap gap-2 mt-3 px-2">
        <SuggestionButton
          text="¿Hay descuentos?"
          onClick={() => onSuggestionClick("¿Hay descuentos o promociones disponibles?")}
        />
        <SuggestionButton
          text="¿Puedo cambiar de plan?"
          onClick={() => onSuggestionClick("¿Puedo cambiar de plan mensual a anual?")}
        />
        <SuggestionButton
          text="¿Cuáles son las diferencias?"
          onClick={() => onSuggestionClick("¿Cuáles son las diferencias entre los planes?")}
        />
      </div>
    );
  }

  // Sugerencias para administradores sobre accesos (SOLO SI ES VERDADERAMENTE ADMIN)
  if (isAdmin && (content.includes('indicador') || content.includes('acceso') || content.includes('usuario'))) {
    return (
      <div className="flex flex-wrap gap-2 mt-3 px-2">
        <SuggestionButton
          text="¿Cuántos usuarios tienen PRO?"
          onClick={() => onSuggestionClick("¿Cuántos usuarios tienen plan PRO activo?")}
        />
        <SuggestionButton
          text="¿Quién tiene acceso al RSI?"
          onClick={() => onSuggestionClick("¿Qué usuarios tienen acceso al indicador RSI?")}
        />
        <SuggestionButton
          text="¿Hay expiraciones pronto?"
          onClick={() => onSuggestionClick("¿Qué accesos van a expirar en los próximos 7 días?")}
        />
      </div>
    );
  }

  // Sugerencias para usuarios sobre indicadores
  if (userData && (content.includes('indicador') || content.includes('acceso'))) {
    return (
      <div className="flex flex-wrap gap-2 mt-3 px-2">
        <SuggestionButton
          text="¿Cuántos indicadores tengo?"
          onClick={() => onSuggestionClick("¿Cuántos indicadores tengo activos actualmente?")}
        />
        <SuggestionButton
          text="¿Cuándo expira mi acceso?"
          onClick={() => onSuggestionClick("¿Cuándo expira mi acceso a los indicadores?")}
        />
        <SuggestionButton
          text="¿Puedo renovar?"
          onClick={() => onSuggestionClick("¿Puedo renovar mi acceso a los indicadores?")}
        />
      </div>
    );
  }

  // Sugerencias generales después del primer mensaje
  if (messages.length === 2) {
    return (
      <div className="flex flex-wrap gap-2 mt-3 px-2">
        <SuggestionButton
          text="¿Qué indicadores ofrecen?"
          onClick={() => onSuggestionClick("¿Qué indicadores ofrecen en APIDevs?")}
        />
        <SuggestionButton
          text="¿Cómo me registro?"
          onClick={() => onSuggestionClick("¿Cómo me registro en la plataforma?")}
        />
        <SuggestionButton
          text="¿Necesito TradingView?"
          onClick={() => onSuggestionClick("¿Necesito tener cuenta de TradingView para usar los indicadores?")}
        />
      </div>
    );
  }

  return null;
}

// Componente para botones de sugerencias
function SuggestionButton({ text, onClick, special }: { text: string; onClick: () => void; special?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 whitespace-nowrap ${
        special
          ? "bg-gradient-to-r from-[#aaff00] to-[#C9D92E] text-black font-semibold hover:from-[#C9D92E] hover:to-[#aaff00] shadow-lg animate-pulse"
          : "bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#444] hover:border-[#555] text-gray-300 hover:text-[#aaff00]"
      }`}
    >
      {text}
    </button>
  );
}

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

  // Verificar autenticación al abrir el chat
  useEffect(() => {
    if (isOpen && !authChecked) {
      checkAuthStatus();
    }
  }, [isOpen, authChecked]);

  // Auto-scroll cuando llegan nuevos mensajes o cuando está cargando
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Función para hacer scroll automático al final
  const scrollToBottom = () => {
    // Solo hacer scroll si el usuario está cerca del final (últimos 100px)
    // Esto evita interrumpir la lectura de mensajes antiguos
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom) {
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

  const addWelcomeMessage = (user: UserData) => {
    const isLegacyUser = user.has_legacy_discount_eligible ||
                        user.is_legacy_user ||
                        user.legacy_customer ||
                        (user.legacy_discount_percentage || 0) > 0;

    let welcomeMessage = `¡Hola ${user.full_name || user.email}! 👋

Soy tu asistente de APIDevs y puedo ayudarte con:
• Información sobre tu cuenta y suscripción
• Consultas sobre indicadores y planes
• Soporte técnico`;

    // 🚀 Agregar mensaje especial para usuarios LEGACY
    if (isLegacyUser) {
      const discountPercent = user.legacy_discount_percentage || 50;
      welcomeMessage += `

⭐ **¡Felicitaciones!** Eres uno de nuestros primeros y más valiosos clientes legacy. Como reconocimiento a tu lealtad histórica, tienes un **${discountPercent}% de descuento** en todos nuestros planes.`;
    }

    welcomeMessage += `

¿En qué puedo ayudarte hoy?`;

    setMessages([{
      id: Date.now().toString(),
      role: "assistant",
      content: welcomeMessage,
    }]);
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
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        
        // Agregar el chunk directamente al mensaje
        fullResponse += chunk;
        
        // Actualizar el mensaje en tiempo real
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
      }

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
    <>
      {/* Botón flotante con GIF */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group transition-all duration-300 hover:scale-105"
        >
          {/* GIF animado */}
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-[#aaff00] bg-black hover:border-[#C9D92E] transition-colors duration-300">
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
              ¡Hola! ¿En qué puedo ayudarte?
              <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          )}
        </button>
      </div>

      {/* Widget de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-[#1a1a1a] rounded-lg shadow-2xl border border-[#333] flex flex-col backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#aaff00] to-[#C9D92E] text-black p-4 rounded-t-lg flex justify-between items-center">
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
            className="flex-1 overflow-y-auto p-4 bg-[#1a1a1a] space-y-3"
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

            {/* Sugerencias contextuales */}
            {!isLoading && messages.length > 0 && (
              <ContextualSuggestions
                userData={userData}
                messages={messages}
                onSuggestionClick={(suggestion) => {
                  setInput(suggestion);
                  // Auto-enviar después de un pequeño delay
                  setTimeout(() => {
                    const form = document.querySelector('form');
                    if (form) form.requestSubmit();
                  }, 100);
                }}
              />
            )}
          </div>

          {/* Input o Auth */}
          {showAuth ? (
            <ChatAuth 
              onAuthSuccess={handleAuthSuccess}
              onGuestContinue={handleGuestContinue}
            />
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-[#1a1a1a] border-t border-[#333]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aaff00] focus:border-[#aaff00] text-white placeholder-gray-400 text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-[#aaff00] text-white rounded-lg hover:bg-[#C9D92E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
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
