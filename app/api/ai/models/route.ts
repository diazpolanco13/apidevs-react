/**
 * API Route para obtener la lista de modelos disponibles de OpenRouter
 * GET /api/ai/models
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache por 1 hora

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    context_length: number;
    max_completion_tokens: number;
  };
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

export async function GET() {
  try {
    // Llamar a la API de OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache por 1 hora
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();

    // Filtrar y formatear los modelos más relevantes
    const relevantModels = data.data
      .filter(model => {
        const id = model.id.toLowerCase();
        // Filtrar solo los modelos más populares y relevantes
        return (
          id.includes('claude') ||
          id.includes('gpt-4') ||
          id.includes('gemini') ||
          id.includes('llama') ||
          id.includes('deepseek') ||
          id.includes('mistral') ||
          id.includes('qwen')
        );
      })
      .map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || '',
        contextWindow: model.context_length || model.top_provider?.context_length || 0,
        pricing: {
          prompt: parseFloat(model.pricing.prompt) * 1000000, // Convertir a por millón
          completion: parseFloat(model.pricing.completion) * 1000000,
        },
        isFree: model.id.includes(':free'),
        provider: model.id.split('/')[0],
      }))
      .sort((a, b) => {
        // Ordenar: modelos gratis primero, luego por precio
        if (a.isFree && !b.isFree) return -1;
        if (!a.isFree && b.isFree) return 1;
        return a.pricing.prompt - b.pricing.prompt;
      });

    return NextResponse.json({
      success: true,
      models: relevantModels,
      total: relevantModels.length,
      cached: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch models from OpenRouter',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

