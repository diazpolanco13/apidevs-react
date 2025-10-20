/**
 * Conversation Manager
 * 
 * Sistema de gestión de conversaciones del chatbot
 * - Crear conversaciones
 * - Guardar mensajes
 * - Cargar historial
 * - Generar títulos automáticos con IA
 */

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
  message_count?: number;
}

/**
 * Crear o recuperar conversación actual
 */
export async function getOrCreateConversation(
  userId: string | null,
  isGuest: boolean = false
): Promise<string | null> {
  try {
    // Para invitados, no guardamos conversaciones
    if (isGuest || !userId) {
      return null;
    }

    const supabase = await createClient();

    // Buscar conversación activa reciente (última 24h)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: recentConversation } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', userId)
      .gte('updated_at', twentyFourHoursAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (recentConversation) {
      return recentConversation.id;
    }

    // Crear nueva conversación
    const { data: newConversation, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title: 'Nueva conversación',
        visibility: 'private',
        metadata: {}
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return newConversation.id;
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    return null;
  }
}

/**
 * Guardar mensaje en la conversación
 */
export async function saveMessage(
  conversationId: string | null,
  message: Message
): Promise<boolean> {
  try {
    // Si no hay conversación, no guardar
    if (!conversationId) {
      return false;
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        parts: { content: message.content },
        attachments: []
      });

    if (error) {
      console.error('Error saving message:', error);
      return false;
    }

    // Actualizar timestamp de conversación
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return true;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    return false;
  }
}

/**
 * Generar título de conversación automáticamente con IA
 */
export async function generateConversationTitle(
  conversationId: string,
  firstUserMessage: string
): Promise<void> {
  try {
    // Limitar longitud del mensaje para el análisis
    const messageForTitle = firstUserMessage.substring(0, 200);
    
    // Generar título simple (máx 60 caracteres)
    let title = messageForTitle.substring(0, 60);
    
    // Si el mensaje es muy corto, usarlo completo
    if (messageForTitle.length < 40) {
      title = messageForTitle;
    } else {
      // Buscar el último espacio para no cortar palabras
      const lastSpace = title.lastIndexOf(' ');
      if (lastSpace > 20) {
        title = title.substring(0, lastSpace) + '...';
      }
    }

    const supabase = await createClient();

    // Actualizar título
    await supabase
      .from('chat_conversations')
      .update({ title })
      .eq('id', conversationId);

  } catch (error) {
    console.error('Error generating title:', error);
  }
}

/**
 * Cargar historial de conversaciones del usuario
 */
export async function loadUserConversations(
  userId: string,
  limit: number = 20
): Promise<Conversation[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        id,
        user_id,
        title,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading conversations:', error);
      return [];
    }

    // Contar mensajes por conversación
    const conversationsWithCount = await Promise.all(
      (data || []).map(async (conv) => {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        return {
          ...conv,
          message_count: count || 0
        };
      })
    );

    return conversationsWithCount;
  } catch (error) {
    console.error('Error in loadUserConversations:', error);
    return [];
  }
}

/**
 * Cargar mensajes de una conversación específica
 */
export async function loadConversationMessages(
  conversationId: string
): Promise<Message[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_messages')
      .select('role, parts, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return [];
    }

    return (data || []).map(msg => ({
      role: msg.role as any,
      content: typeof msg.parts === 'object' && msg.parts !== null && 'content' in msg.parts 
        ? String((msg.parts as any).content) 
        : '',
      timestamp: msg.created_at || undefined
    }));
  } catch (error) {
    console.error('Error in loadConversationMessages:', error);
    return [];
  }
}

/**
 * Eliminar conversación (solo para el usuario)
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Verificar que la conversación pertenece al usuario
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || conversation.user_id !== userId) {
      console.error('Conversation not found or unauthorized');
      return false;
    }

    // Eliminar mensajes primero (FK constraint)
    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);

    // Eliminar conversación
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de conversaciones (para admin)
 */
export async function getConversationStats(): Promise<{
  total: number;
  last24h: number;
  last7days: number;
  last30days: number;
  avgMessagesPerConv: number;
}> {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total conversaciones
    const { count: total } = await (supabaseAdmin as any)
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true });

    // Última 24h
    const { count: last24h } = await (supabaseAdmin as any)
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString());

    // Últimos 7 días
    const { count: last7days } = await (supabaseAdmin as any)
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Últimos 30 días
    const { count: last30days } = await (supabaseAdmin as any)
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Promedio de mensajes por conversación
    const { count: totalMessages } = await (supabaseAdmin as any)
      .from('chat_messages')
      .select('*', { count: 'exact', head: true });

    const avgMessagesPerConv = total && total > 0 
      ? Math.round((totalMessages || 0) / total) 
      : 0;

    return {
      total: total || 0,
      last24h: last24h || 0,
      last7days: last7days || 0,
      last30days: last30days || 0,
      avgMessagesPerConv
    };
  } catch (error) {
    console.error('Error in getConversationStats:', error);
    return {
      total: 0,
      last24h: 0,
      last7days: 0,
      last30days: 0,
      avgMessagesPerConv: 0
    };
  }
}

