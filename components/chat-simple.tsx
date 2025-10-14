"use client";

import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatSimple() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo leer la respuesta");
      }

      let assistantMessage = "";
      const assistantMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        console.log('Chunk recibido:', chunk); // Debug
        
        // Si el chunk viene como texto plano (no JSON), lo agregamos directamente
        if (chunk && !chunk.includes('data:') && chunk.trim()) {
          assistantMessage += chunk;
          console.log('Agregando texto directo:', chunk); // Debug
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: assistantMessage }
              : msg
          ));
          continue;
        }
        
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Data parseada:', data); // Debug
              
              // X.AI usa diferentes formatos, vamos a capturar todos los tipos de texto
              if (data.type === 'text-delta' && data.textDelta) {
                assistantMessage += data.textDelta;
              } else if (data.type === 'text' && data.text) {
                assistantMessage += data.text;
              } else if (data.type === 'content' && data.content) {
                assistantMessage += data.content;
              } else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                // Formato estándar de OpenAI/X.AI
                assistantMessage += data.choices[0].delta.content;
              }
              
              // Actualizar el mensaje en tiempo real solo si hay contenido nuevo
              if (assistantMessage.trim()) {
                console.log('Actualizando mensaje con:', assistantMessage); // Debug
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              }
              
            } catch (e) {
              console.log('Error parsing JSON:', e, 'Line:', line); // Debug
            }
          }
        }
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">🤖 Asistente APIDevs</h1>
        <p className="text-sm opacity-90">Tu asistente virtual para consultas sobre planes y indicadores</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-700 mt-8">
            <p className="text-lg font-medium">¡Hola! Soy tu asistente de APIDevs. ¿En qué puedo ayudarte?</p>
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
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black border-2 border-gray-200 shadow-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap font-medium">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-black border-2 border-gray-200 shadow-sm px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">🤔 Pensando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre planes, indicadores, o tu cuenta..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
