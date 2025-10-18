import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

interface GrokImageRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'abstract';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  apiKey?: string; // Para testing
}

interface GrokImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  details?: any;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'realistic', size = '1024x1024', quality = 'standard', apiKey }: GrokImageRequest = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
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
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Verificar permisos de generación de imágenes
    const userPermissions = admin.admin_roles?.permissions || {};
    const hasPermission = userPermissions['content.ai.images'] || admin.admin_roles?.slug === 'super-admin';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions for image generation' },
        { status: 403 }
      );
    }

    // Obtener API key de OpenRouter y modelo de imágenes
    let openrouterApiKey = apiKey; // Si se pasa en el body (para test)
    
    if (!openrouterApiKey) {
      const { data: openrouterConfig } = await (supabaseAdmin as any)
        .from('system_configuration')
        .select('value')
        .eq('key', 'openrouter_api_key')
        .single();
      openrouterApiKey = openrouterConfig?.value;
    }

    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured for image generation' },
        { status: 400 }
      );
    }

    // Obtener modelo de imágenes configurado
    const { data: imageSettings } = await (supabaseAdmin as any)
      .from('ai_content_settings')
      .select('image_model_name')
      .single();

    const imageModel = imageSettings?.image_model_name || 'google/gemini-2.5-flash-image';

    // Generar imagen con OpenRouter (usa chat/completions endpoint)
    try {
      const openrouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      
      const requestBody = {
        model: imageModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text'] // REQUERIDO para generación de imágenes
      };

      console.log('Generating image with OpenRouter:', {
        model: imageModel,
        prompt: prompt.substring(0, 100) + '...',
        style,
        size,
        quality
      });

      const response = await fetch(openrouterApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://apidevs.io',
          'X-Title': 'APIDevs Content Creator'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData;
        const responseText = await response.text();
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          // Si no es JSON válido, usar el texto directo
          errorData = { message: responseText || 'Unknown error' };
        }
        
        console.error('OpenRouter Image API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          model: imageModel
        });
        
        return NextResponse.json({
          success: false,
          error: `OpenRouter Image API error: ${response.status} ${response.statusText}`,
          details: errorData
        });
      }

      const data = await response.json();
      
      // Log para debugging COMPLETO
      console.log('OpenRouter image generation response:', {
        model: imageModel,
        prompt: prompt.substring(0, 50) + '...',
        hasChoices: !!data.choices,
        message: data.choices?.[0]?.message,
        fullResponse: JSON.stringify(data, null, 2)
      });

      // Según la documentación de OpenRouter, pueden haber múltiples imágenes
      const images = data.choices?.[0]?.message?.images || [];
      
      if (images.length === 0) {
        console.error('No images in response:', {
          hasChoices: !!data.choices,
          hasMessage: !!data.choices?.[0]?.message,
          hasImages: !!data.choices?.[0]?.message?.images,
          fullResponse: data
        });
        return NextResponse.json({
          success: false,
          error: 'No images generated',
          details: data
        });
      }

      console.log(`✅ Generated ${images.length} image(s)`);

      // Obtener TODAS las URLs de imágenes
      const imageUrls = images.map((img: any) => img.image_url?.url).filter(Boolean);

      // SUBIR TODAS LAS IMÁGENES A SUPABASE STORAGE
      const uploadedImages = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        let publicImageUrl = imageUrl;
        
        if (imageUrl.startsWith('data:image')) {
          try {
            // Extraer base64
            const base64Data = imageUrl.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            // Nombre único para la imagen
            const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.png`;
            const filePath = `generated/${fileName}`;
            
            // Subir a Supabase Storage
            const { data: uploadData, error: uploadError } = await (supabaseAdmin as any)
              .storage
              .from('content-images')
              .upload(filePath, imageBuffer, {
                contentType: 'image/png',
                cacheControl: '3600',
                upsert: false
              });

            if (!uploadError) {
              // Obtener URL pública
              const { data: publicUrlData } = (supabaseAdmin as any)
                .storage
                .from('content-images')
                .getPublicUrl(filePath);
              
              publicImageUrl = publicUrlData.publicUrl;
              console.log(`✅ Image ${i + 1} uploaded:`, publicImageUrl);
            }
          } catch (uploadError) {
            console.error(`Error uploading image ${i + 1}:`, uploadError);
          }
        }
        
        uploadedImages.push({
          url: publicImageUrl,
          base64: imageUrl,
          index: i
        });
      }
      
      // NO guardar en cola - solo devolver las imágenes
      // Las imágenes se adjuntarán al post cuando el usuario haga "Crear Contenido"
      console.log('✅ Images generated and uploaded. Ready to be attached to content.');

      return NextResponse.json({
        success: true,
        images: uploadedImages, // TODAS las imágenes
        imageUrl: uploadedImages[0].url, // Primera por defecto para compatibilidad
        imageCount: uploadedImages.length,
        details: {
          prompt: prompt,
          style: style,
          size: size,
          quality: quality,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('OpenRouter image generation error:', error);
      return NextResponse.json({
        success: false,
        error: `Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

  } catch (error) {
    console.error('Error in Grok image generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
