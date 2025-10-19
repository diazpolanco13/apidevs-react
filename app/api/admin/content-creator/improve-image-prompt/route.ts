import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getImagePromptTemplate } from '@/utils/ai/prompt-templates';

export async function POST(request: NextRequest) {
  try {
    const { articleData } = await request.json();

    if (!articleData) {
      return NextResponse.json(
        { error: 'Article data is required' },
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
    const directorDeArtePrompt = await getImagePromptTemplate(articleData);

    // Llamar a OpenRouter con el Director de Arte
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.value}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apidevs.io',
        'X-Title': 'APIDevs Content Creator - Director de Arte'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // Claude para análisis profundo
        messages: [
          { role: 'user', content: directorDeArtePrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Error improving image prompt', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const improvedImageData = data.choices[0].message.content;

    // Parsear el JSON
    let parsedImageData;
    try {
      const jsonMatch = improvedImageData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedImageData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('Error parsing image prompt JSON:', e);
      return NextResponse.json(
        { error: 'Error parsing response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt: parsedImageData.prompt,
      alt: parsedImageData.alt,
      caption: parsedImageData.caption,
      tokens_used: data.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error('Error improving image prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

