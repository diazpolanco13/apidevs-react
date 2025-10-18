import { useState, useEffect } from 'react';

interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token: string;
  openai_api_key?: string;
  openrouter_api_key?: string;
  isConfigured: boolean;
}

interface SanityContentResult {
  success: boolean;
  documentId?: string;
  document?: any;
  message?: string;
  error?: string;
}

export function useSanityIntegration() {
  const [config, setConfig] = useState<SanityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración de Sanity
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content-creator/sanity/config');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load Sanity config');
      }

      setConfig(result.config);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Sanity config');
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración de Sanity
  const saveConfig = async (newConfig: Partial<SanityConfig>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content-creator/sanity/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save Sanity config');
      }

      // Recargar configuración inmediatamente
      await loadConfig();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Sanity config');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear contenido en Sanity
  const createContent = async (contentData: {
    title: string;
    content: string;
    type: 'blog' | 'docs' | 'indicators';
    language: 'es' | 'en';
    user_prompt?: string;
    queueItemId?: string;
  }): Promise<SanityContentResult> => {
    try {
      const response = await fetch('/api/admin/content-creator/sanity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create content in Sanity');
      }

      return {
        success: true,
        documentId: result.sanityResult.documentId,
        document: result.sanityResult.document,
        message: result.message,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create content in Sanity',
      };
    }
  };

  // Test de conexión con Sanity
  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Obtener configuración actual
      await loadConfig();
      
      if (!config?.isConfigured) {
        return {
          success: false,
          message: 'Configuración de Sanity incompleta'
        };
      }

      // Hacer test real con las credenciales
      const response = await fetch('/api/admin/content-creator/sanity/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: config.projectId,
          dataset: config.dataset,
          token: config.token === '***configured***' ? 'using_saved_token' : config.token
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Error al probar la conexión'
        };
      }

      return {
        success: true,
        message: result.message || 'Conexión con Sanity exitosa'
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Error al probar la conexión'
      };
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    createContent,
    testConnection,
  };
}
