import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

interface GenerateContentRequest {
  prompt: string;
  type: 'blog' | 'docs' | 'indicators';
  language: 'es' | 'en';
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, language }: GenerateContentRequest = await request.json();

    if (!prompt || !type || !language) {
      return NextResponse.json(
        { error: 'Prompt, type, and language are required' },
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

    // Verificar permisos de Content Creator
    const { data: admin, error: adminError } = await (supabaseAdmin as any)
      .from('admin_users')
      .select(`
        id,
        status,
        role_id,
        admin_roles (
          slug,
          permissions
        )
      `)
      .eq('email', user.email)
      .eq('status', 'active')
      .single();

    if (adminError || !admin) {
      console.warn(`❌ Admin user not found or error: ${adminError?.message}`);
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const userPermissions = admin.admin_roles?.permissions || {};
    const hasPermission = userPermissions['content.ai.create.blog'] || admin.admin_roles?.slug === 'super-admin';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions for content creation' },
        { status: 403 }
      );
    }

    // Obtener modelo y configuración de IA
    const { data: aiSettings } = await (supabaseAdmin as any)
      .from('ai_content_settings')
      .select('*')
      .single();

    if (!aiSettings || !aiSettings.enabled) {
      return NextResponse.json(
        { error: 'AI Content Creator is not enabled' },
        { status: 400 }
      );
    }

    // Obtener API key del modelo
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

    // Generar contenido con IA usando OpenRouter
    const systemPrompt = generateSystemPrompt(type, language);
    const userPrompt = generateUserPrompt(prompt, type, language);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.value}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apidevs.io',
        'X-Title': 'APIDevs Content Creator'
      },
      body: JSON.stringify({
        model: aiSettings.model_name || 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: aiSettings.temperature || 0.7,
        max_tokens: aiSettings.max_tokens || 8000, // Usar configuración o 8000 por defecto
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Error generating content with AI', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parsear el contenido generado (esperamos JSON)
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (e) {
      // Si no es JSON válido, intentar extraer título y contenido
      const titleMatch = generatedContent.match(/título:\s*(.+)/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Título generado';
      const content = generatedContent.replace(/título:\s*.+/i, '').trim();
      
      parsedContent = { title, content };
    }

    return NextResponse.json({
      success: true,
      title: parsedContent.title || 'Título generado',
      content: parsedContent.content || generatedContent,
      metaDescription: parsedContent.metaDescription || '',
      keywords: parsedContent.keywords || [],
      slug: parsedContent.slug || '',
      excerpt: parsedContent.excerpt || '',
      tokens_used: data.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSystemPrompt(type: string, language: string): string {
  const lang = language === 'es' ? 'español' : 'inglés';
  
  const basePrompt = `Eres un experto creador de contenido para una plataforma de trading e indicadores técnicos. Tu tarea es generar contenido de alta calidad, profesional y optimizado para SEO.`;

  const typePrompts = {
    blog: `Genera un artículo de blog COMPLETO y PROFESIONAL en ${lang}. El artículo debe ser informativo, educativo y atractivo para traders de todos los niveles.`,
    docs: `Genera documentación técnica CLARA y PRECISA en ${lang}. La documentación debe ser fácil de seguir, con ejemplos prácticos y explicaciones detalladas.`,
    indicators: `Genera una descripción COMPLETA de un indicador técnico en ${lang}. Incluye qué es, cómo funciona, cómo se calcula y cómo usarlo en trading.`,
  };

  return `${basePrompt}

${typePrompts[type as keyof typeof typePrompts]}

REQUISITOS OBLIGATORIOS:
- Mínimo 800-1200 palabras
- Formato Markdown profesional
- Incluir estadísticas o datos relevantes
- Ejemplos prácticos y casos reales
- Subtítulos descriptivos (H2, H3)
- Listas y bullet points
- Conclusión con llamada a la acción
- Tono profesional pero accesible

OPTIMIZACIÓN SEO:
- Título atractivo con palabras clave
- Meta description de 150-160 caracteres
- 5-7 keywords relevantes
- Estructura optimizada para búsqueda
- Contenido único y de valor

IMPORTANTE: Responde SOLO con un JSON en el siguiente formato:
{
  "title": "Título atractivo y optimizado SEO (60-70 caracteres)",
  "content": "Contenido completo en formato markdown (mínimo 800 palabras)",
  "metaDescription": "Meta description optimizada (150-160 caracteres)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "slug": "url-amigable-para-seo",
  "excerpt": "Resumen breve del contenido (2-3 líneas)"
}

NO incluyas ningún texto adicional fuera del JSON.`;
}

function generateUserPrompt(userPrompt: string, type: string, language: string): string {
  return `Crea un ${type} sobre: ${userPrompt}

El contenido debe ser:
- Profesional y bien estructurado
- Optimizado para SEO
- Con ejemplos prácticos si aplica
- En formato markdown
- Mínimo 500 palabras
- Con subtítulos y secciones claras`;
}

