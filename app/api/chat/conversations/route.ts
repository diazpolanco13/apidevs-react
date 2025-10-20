import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { loadUserConversations } from '@/lib/ai/conversation-manager';

/**
 * GET /api/chat/conversations
 * 
 * Obtiene el historial de conversaciones del usuario autenticado
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const conversations = await loadUserConversations(user.id, 50);

    return NextResponse.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Error loading conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/conversations?id=xxx
 * 
 * Elimina una conversación específica
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verificar que la conversación pertenece al usuario
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
    }

    // Eliminar mensajes primero
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
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

