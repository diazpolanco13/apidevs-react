'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ConversationStats {
  totalConversations: number;
  activeUsers: number;
  totalMessages: number;
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  trends: {
    conversations: number;
    users: number;
    messages: number;
  };
}

export default function ConversationMetrics() {
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversationStats();
  }, []);

  const fetchConversationStats = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint real cuando esté disponible
      // const response = await fetch('/api/admin/chat-stats');
      // const data = await response.json();
      
      // Datos de demostración
      const mockData: ConversationStats = {
        totalConversations: 0,
        activeUsers: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        trends: {
          conversations: 0,
          users: 0,
          messages: 0,
        }
      };
      
      setStats(mockData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-700/30 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-yellow-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Error cargando las estadísticas de conversaciones</span>
        </div>
      </div>
    );
  }

  const hasData = stats.totalConversations > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Métricas de Conversaciones</h3>
          <p className="text-xs text-gray-400">Estadísticas de uso del chatbot IA</p>
        </div>
        <button
          onClick={fetchConversationStats}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Actualizar
        </button>
      </div>

      {!hasData ? (
        // Estado sin datos
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Sin conversaciones registradas</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Las métricas aparecerán cuando los usuarios empiecen a interactuar con el chatbot.
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-gray-400">Chatbot operativo y listo</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Estado con datos
        <div className="space-y-4">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Conversaciones Totales */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-xl border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                </div>
                {stats.trends.conversations !== 0 && (
                  <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
                    stats.trends.conversations > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`w-2.5 h-2.5 ${stats.trends.conversations < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(stats.trends.conversations)}%
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold text-white">{stats.totalConversations.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">Conversaciones totales</p>
              </div>
            </div>

            {/* Usuarios Activos */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-xl border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                {stats.trends.users !== 0 && (
                  <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
                    stats.trends.users > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`w-2.5 h-2.5 ${stats.trends.users < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(stats.trends.users)}%
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold text-white">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">Usuarios activos</p>
              </div>
            </div>

            {/* Mensajes Totales */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-xl border border-green-500/30 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                </div>
                {stats.trends.messages !== 0 && (
                  <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
                    stats.trends.messages > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`w-2.5 h-2.5 ${stats.trends.messages < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(stats.trends.messages)}%
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold text-white">{stats.totalMessages.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">Mensajes intercambiados</p>
              </div>
            </div>
          </div>

          {/* Métricas de rendimiento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tiempo de Respuesta */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Tiempo Promedio</p>
                  <p className="text-lg font-bold text-white">{stats.avgResponseTime.toFixed(2)}s</p>
                </div>
              </div>
            </div>

            {/* Tasa de Éxito */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Tasa de Éxito</p>
                  <p className="text-lg font-bold text-white">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Tasa de Error */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500/20 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Tasa de Error</p>
                  <p className="text-lg font-bold text-white">{stats.errorRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota informativa */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400">
            <strong className="text-blue-400">Próximamente:</strong> Análisis detallado, satisfacción del usuario, temas consultados y sugerencias.
          </div>
        </div>
      </div>
    </div>
  );
}

