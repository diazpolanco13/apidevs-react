import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { loadConversationMessages } from '@/lib/ai/conversation-manager';

/**
 * GET /api/chat/conversations/[id]
 * 
 * Obtiene todos los mensajes de una conversación específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .select('user_id, title')
      .eq('id', id)
      .single();

    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
    }

    const messages = await loadConversationMessages(id);

    return NextResponse.json({
      success: true,
      conversation: {
        id,
        title: conversation.title
      },
      messages
    });

  } catch (error) {
    console.error('Error loading conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

