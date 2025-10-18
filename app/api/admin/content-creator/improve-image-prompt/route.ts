import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

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

    // Mega-Prompt del Director de Arte
    const directorDeArtePrompt = `# ROL Y OBJETIVO
Actuarás como un **Director de Arte y Especialista en SEO de Contenidos** con una profunda comprensión de la estética visual y la optimización para motores de búsqueda.

# TAREA
Recibirás el contenido completo de un artículo de blog en formato JSON. Tu única tarea es analizar a fondo el título, el extracto y el contenido para generar un nuevo objeto JSON con tres claves: \`prompt\`, \`alt\` y \`caption\`, destinadas a crear la imagen principal perfecta para la publicación.

# REGLAS PARA LA GENERACIÓN DE CADA CAMPO

### 1. Para la clave \`prompt\`:
Debes crear un prompt de texto detallado y evocador para un modelo de generación de imágenes de IA (Gemini 2.5 Flash Image). El prompt debe:
* **Capturar la Metáfora Central:** Identifica el concepto más importante del artículo (ej: "IA analizando datos", "evolución tecnológica", "estrategia cuantitativa") y conviértelo en una metáfora visual potente.
* **Ser Descriptivo y Específico:** Describe la composición, el sujeto principal, el fondo, la paleta de colores y la iluminación.
* **Definir el Estilo Artístico:** Especifica un estilo claro (ej: \`photorealistic\`, \`digital art\`, \`cinematic\`, \`futuristic\`, \`minimalist\`, \`sophisticated\`).
* **Incluir Palabras Clave de Calidad:** Utiliza adjetivos y términos que los modelos de imagen entienden bien para generar resultados de alta calidad, como \`hyper-detailed\`, \`8K\`, \`professional lighting\`, \`cinematic lighting\`, \`hyper-realistic\`.
* **Evitar Clichés:** No pidas imágenes genéricas de "robots y gráficos". Sé creativo.
* **Ser Conciso:** Aunque detallado, debe ser un párrafo único y coherente.

### 2. Para la clave \`alt\` (Texto Alternativo):
Debes escribir un texto alternativo optimizado para SEO y accesibilidad. Debe:
* **Describir la Imagen Literalmente:** Explica de forma concisa lo que se ve en la imagen que el \`prompt\` generaría.
* **Incluir la Palabra Clave Principal:** Integra de forma natural la palabra clave principal del artículo (extraída del slug o el título).
* **Ser Breve:** Mantente por debajo de los 125 caracteres.
* **Ser para Humanos y Robots:** Debe ser útil para alguien que usa un lector de pantalla y para Google.

### 3. Para la clave \`caption\` (Leyenda de la Imagen):
Debes crear una leyenda corta y atractiva para mostrar debajo de la imagen. Debe:
* **Aportar Contexto:** Conecta la imagen con la idea principal del artículo.
* **Ser Sugerente:** No describas la imagen, interpreta su significado en relación con el texto.
* **Ser Breve e Impactante:** Una sola frase potente.

# ENTRADA
A continuación se proporciona el JSON del artículo a analizar:
${JSON.stringify(articleData, null, 2)}

# FORMATO DE SALIDA
Tu respuesta debe ser **únicamente el objeto JSON válido** con las tres claves (\`prompt\`, \`alt\`, \`caption\`), sin texto adicional, explicaciones o saludos.

Ejemplo de formato de salida:
{
  "prompt": "...",
  "alt": "...",
  "caption": "..."
}`;

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

