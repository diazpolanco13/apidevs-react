import { useState } from 'react';

interface GrokImageRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'abstract';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
}

interface GrokImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  details?: any;
}

export function useGrokImageGeneration() {
  const [generating, setGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<GrokImageResponse | null>(null);

  const generateImage = async (request: GrokImageRequest): Promise<GrokImageResponse> => {
    try {
      setGenerating(true);
      setLastResult(null);

      // Obtener la API key de OpenAI desde la configuración
      const configResponse = await fetch('/api/admin/content-creator/sanity/config');
      const configData = await configResponse.json();
      
      if (!configData.success || !configData.config?.openai_api_key) {
        const errorResult = {
          success: false,
          error: 'OpenAI API key not configured for image generation',
          details: null
        };
        setLastResult(errorResult);
        return errorResult;
      }

      const response = await fetch('/api/admin/content-creator/grok/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          apiKey: configData.config.openai_api_key
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorResult = {
          success: false,
          error: result.error || 'Error generating image',
          details: result.details
        };
        setLastResult(errorResult);
        return errorResult;
      }

      const successResult = {
        success: true,
        imageUrl: result.imageUrl,
        details: result.details
      };
      
      setLastResult(successResult);
      return successResult;

    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Error generating image',
        details: error
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setGenerating(false);
    }
  };

  const generateImageForContent = async (
    contentTitle: string,
    contentType: 'blog' | 'docs' | 'indicators',
    style: 'realistic' | 'artistic' | 'cartoon' | 'abstract' = 'realistic'
  ): Promise<GrokImageResponse> => {
    // Generar prompt automático basado en el contenido
    let prompt = '';
    
    switch (contentType) {
      case 'blog':
        prompt = `Create a professional blog header image for: "${contentTitle}". Style: ${style}, high quality, modern design, suitable for tech blog`;
        break;
      case 'docs':
        prompt = `Create a technical documentation illustration for: "${contentTitle}". Style: ${style}, clean, informative, professional`;
        break;
      case 'indicators':
        prompt = `Create a data visualization or chart illustration for: "${contentTitle}". Style: ${style}, business-oriented, clean design`;
        break;
      default:
        prompt = `Create an image for: "${contentTitle}". Style: ${style}, professional, high quality`;
    }

    return generateImage({
      prompt,
      style,
      size: '1024x1024',
      quality: 'hd'
    });
  };

  const clearLastResult = () => {
    setLastResult(null);
  };

  return {
    generating,
    lastResult,
    generateImage,
    generateImageForContent,
    clearLastResult,
  };
}
