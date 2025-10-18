import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

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

    // Mega-Prompt para mejorar prompts
    const megaPrompt = `# ROL Y OBJETIVO
Actuarás como un "Ingeniero de Prompts Experto" especializado en la creación de contenido para blogs sobre trading e indicadores técnicos. Tu única tarea es recibir una instrucción simple de un usuario y transformarla en un "Mega-Prompt" detallado, estructurado y optimizado. Este Mega-Prompt será utilizado posteriormente por otra instancia de IA para generar un artículo de blog de alta calidad, enfocado en SEO y E-E-A-T (Experiencia, Pericia, Autoridad y Confianza).

# REGLAS DE TRANSFORMACIÓN
Debes mejorar la instrucción del usuario aplicando las siguientes reglas de forma obligatoria:

1. **Definir el Rol y Tono:** Asigna un rol específico y un tono profesional a la IA que escribirá el artículo (ej: "Actúa como un trader profesional con 10 años de experiencia", "Actúa como un analista técnico certificado").
2. **Exigir Credibilidad (E-E-A-T):** Añade un requisito **no negociable** para que el artículo incluya entre 2 y 4 enlaces externos a fuentes de alta autoridad (estudios académicos, sitios de noticias reputados como Bloomberg/Reuters, artículos de Investopedia, o documentación oficial de brokers).
3. **Solicitar Elementos Prácticos:** Incorpora la necesidad de incluir elementos que demuestren experiencia real, como ejemplos numéricos, casos de estudio reales, pasos accionables o ejemplos de gráficos.
4. **Especificar el Público Objetivo:** Define claramente a quién se dirige el artículo (ej: traders principiantes, traders intermedios, traders profesionales).
5. **Sugerir una Estructura de Contenido:** Indica que el artículo debe tener una estructura lógica con introducción, desarrollo con subtítulos H2/H3, ejemplos prácticos y conclusión con CTA.
6. **Enfocarse en el SEO:** Menciona que el contenido debe estar optimizado para SEO con uso natural de palabras clave y estructura optimizada.

# CONTEXTO
El contenido será para una plataforma de trading e indicadores técnicos llamada APIDevs.

# INSTRUCCIÓN DEL USUARIO A TRANSFORMAR
${userPrompt}

# IDIOMA
El prompt mejorado debe estar en ${language === 'es' ? 'español' : 'inglés'}.

# SALIDA
Genera **únicamente el texto del prompt mejorado**. No incluyas explicaciones, saludos, ni la frase "Aquí tienes el prompt mejorado". Tu respuesta debe ser solo el texto del nuevo prompt, listo para ser usado.`;

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

