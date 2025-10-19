import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getGenerateContentTemplate } from '@/utils/ai/prompt-templates';

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
    const systemPrompt = await getGenerateContentTemplate(type, language);
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
      // Intentar extraer el JSON del contenido
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.log('Raw content:', generatedContent);
      
      // Si no es JSON válido, intentar extraer título y contenido
      const titleMatch = generatedContent.match(/título:\s*(.+)/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Título generado';
      const content = generatedContent.replace(/título:\s*.+/i, '').trim();
      
      parsedContent = { 
        title, 
        content,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        excerpt: content.substring(0, 200) + '...',
        tags: [],
        readingTime: Math.ceil(content.split(' ').length / 200),
        seo: {
          metaTitle: title,
          metaDescription: content.substring(0, 150) + '...',
          keywords: []
        }
      };
    }

    // Asegurar que TODOS los campos tengan valores
    const title = parsedContent.title || 'Título generado';
    const slug = parsedContent.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const content = parsedContent.content || generatedContent;
    const excerpt = parsedContent.excerpt || content.substring(0, 200) + '...';

    return NextResponse.json({
      success: true,
      title: title,
      slug: slug,
      excerpt: excerpt,
      content: content,
      mainImage: parsedContent.mainImage || {
        prompt: `Imagen profesional relacionada con: ${title}`,
        alt: title,
        caption: ''
      },
      tags: parsedContent.tags || [],
      readingTime: parsedContent.readingTime || Math.ceil(content.split(' ').length / 200),
      seo: {
        metaTitle: parsedContent.seo?.metaTitle || title.substring(0, 60),
        metaDescription: parsedContent.seo?.metaDescription || excerpt.substring(0, 160),
        keywords: parsedContent.seo?.keywords || parsedContent.keywords || []
      },
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

