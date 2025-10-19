import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getImprovePromptTemplate } from '@/utils/ai/prompt-templates';

export async function POST(request: NextRequest) {
  try {
    const { userPrompt, language } = await request.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: 'User prompt is required' },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté autenticado
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Obtener API key de OpenRouter
    const { data: configData } = await (supabaseAdmin as any)
      .from('system_configuration')
      .select('value')
      .eq('key', 'openrouter_api_key')
      .single();

    if (!configData?.value) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 400 }
      );
    }

    // Obtener Mega-Prompt desde la base de datos (o fallback al hardcoded)
    const megaPrompt = await getImprovePromptTemplate(userPrompt, language);

    // Llamar a OpenRouter para mejorar el prompt
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.value}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apidevs.io',
        'X-Title': 'APIDevs Content Creator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // Usar Claude para mejorar prompts
        messages: [
          { role: 'user', content: megaPrompt }
        ],
        temperature: 0.3, // Baja temperatura para respuestas consistentes
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Error improving prompt', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const improvedPrompt = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      improvedPrompt: improvedPrompt,
      tokens_used: data.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error('Error improving prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

