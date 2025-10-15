/**
 * Proveedores de modelos AI para el chatbot APIDevs
 * Soporta X.AI (Grok) y OpenRouter
 */

import { xai } from "@ai-sdk/xai";
import { createOpenAI } from "@ai-sdk/openai";

export type AIProvider = 'xai' | 'openrouter';

export interface ModelConfig {
  provider: AIProvider;
  model: string;
}

/**
 * Configuración de OpenRouter
 * OpenRouter es compatible con la API de OpenAI, solo necesitamos cambiar el baseURL
 */
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Crear instancia de OpenRouter usando createOpenAI
 */
const openrouter = createOpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

/**
 * Obtiene el modelo configurado según el provider
 */
export function getAIModel(config: ModelConfig) {
  switch (config.provider) {
    case 'xai':
      // X.AI (Grok)
      return xai(config.model);
    
    case 'openrouter':
      // OpenRouter usando el provider de OpenAI con baseURL personalizado
      return openrouter.chat(config.model);
    
    default:
      throw new Error(`Provider no soportado: ${config.provider}`);
  }
}

/**
 * Modelos disponibles por provider
 */
export const AVAILABLE_MODELS = {
  xai: [
    {
      id: 'grok-3',
      name: 'Grok 3',
      description: 'Modelo más reciente y potente de X.AI',
      contextWindow: 131072,
    },
    {
      id: 'grok-2-1212',
      name: 'Grok 2 (Dec 2024)',
      description: 'Modelo anterior de X.AI, más estable',
      contextWindow: 131072,
    },
  ],
  openrouter: [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Mejor modelo de Anthropic, excelente con tools',
      contextWindow: 200000,
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      description: 'Modelo más reciente de OpenAI, multimodal',
      contextWindow: 128000,
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Versión más económica de GPT-4o',
      contextWindow: 128000,
    },
    {
      id: 'google/gemini-2.0-flash-exp:free',
      name: 'Gemini 2.0 Flash (Free)',
      description: 'Modelo gratuito de Google, rápido y eficiente',
      contextWindow: 1000000,
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B',
      description: 'Modelo open-source de Meta, muy capaz',
      contextWindow: 128000,
    },
    {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat (V3/V3.2)',
      description: 'Modelo base económico y rápido',
      contextWindow: 64000,
    },
    {
      id: 'deepseek/deepseek-r1',
      name: 'DeepSeek R1 (MÁS RECIENTE) ⭐',
      description: 'ÚLTIMO MODELO - 671B params, razonamiento avanzado, supera a GPT-4',
      contextWindow: 164000,
    },
    {
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek R1 (Free) ⭐',
      description: 'VERSIÓN GRATIS del modelo más reciente, ideal para testing',
      contextWindow: 164000,
    },
    {
      id: 'deepseek/deepseek-r1-0528',
      name: 'DeepSeek R1 0528',
      description: 'Snapshot del 28 de mayo, estable',
      contextWindow: 164000,
    },
    {
      id: 'deepseek/deepseek-r1-0528:free',
      name: 'DeepSeek R1 0528 (Free)',
      description: 'Versión gratuita del snapshot 0528',
      contextWindow: 164000,
    },
  ],
} as const;

/**
 * Obtiene la configuración por defecto según variables de entorno
 */
export function getDefaultModelConfig(): ModelConfig {
  // Si hay API key de OpenRouter, usar OpenRouter por defecto
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      model: 'anthropic/claude-3.5-sonnet', // Claude es excelente con tools
    };
  }
  
  // Fallback a X.AI
  return {
    provider: 'xai',
    model: 'grok-3',
  };
}

/**
 * Valida que el modelo esté disponible para el provider
 */
export function validateModelConfig(config: ModelConfig): boolean {
  const models = AVAILABLE_MODELS[config.provider];
  if (!models) return false;
  
  return models.some(m => m.id === config.model);
}

