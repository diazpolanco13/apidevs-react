'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface AIContentSettings {
  id: string;
  enabled: boolean;
  default_language: 'es' | 'en';
  model_provider: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  auto_publish_mode: 'draft' | 'review' | 'published';
  require_admin_approval: boolean;
  image_generation_enabled: boolean;
  image_provider: 'grok' | 'dalle' | 'midjourney';
  grok_api_key?: string;
  openrouter_api_key?: string;
  openai_api_key?: string;
  image_model_name?: string;
  seo_optimization_enabled: boolean;
  auto_generate_meta_description: boolean;
  auto_generate_keywords: boolean;
  target_keyword_density: number;
  auto_translate_enabled: boolean;
  translate_after_publish: boolean;
  max_posts_per_day: number;
  max_tokens_per_day: number;
  allowed_admin_ids: string[];
  blog_post_template: Record<string, any>;
  doc_template: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIContentQueueItem {
  id: string;
  content_type: 'blog' | 'doc' | 'indicator' | 'translation';
  status: 'generating' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'failed';
  created_by_admin_id: string;
  reviewed_by_admin_id?: string;
  user_prompt: string;
  ai_instructions?: Record<string, any>;
  generated_content: Record<string, any>;
  sanity_document_id?: string;
  title?: string;
  language: 'es' | 'en';
  tags: string[];
  category?: string;
  meta_description?: string;
  keywords: string[];
  slug?: string;
  generated_images: Record<string, any>[];
  translation_status: 'none' | 'pending' | 'completed' | 'failed';
  translated_content?: Record<string, any>;
  tokens_used: number;
  processing_time_ms?: number;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  published_at?: string;
}

export function useAIContentSettings() {
  const [settings, setSettings] = useState<AIContentSettings | null>(null);
  const [queue, setQueue] = useState<AIContentQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Cargar configuración
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await (supabase as any)
        .from('ai_content_settings')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setSettings(data);
    } catch (err) {
      console.error('Error loading AI content settings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar cola de contenido
  const loadQueue = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('ai_content_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setQueue(data || []);
    } catch (err) {
      console.error('Error loading content queue:', err);
    }
  };

  // Guardar configuración
  const saveSettings = async (newSettings: Partial<AIContentSettings>) => {
    try {
      setSaving(true);
      setError(null);

      if (!settings) {
        throw new Error('No hay configuración para actualizar');
      }

      const { data, error } = await (supabase as any)
        .from('ai_content_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSettings(data);
      return data;
    } catch (err) {
      console.error('Error saving AI content settings:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Crear nuevo elemento en la cola
  const createQueueItem = async (item: Omit<AIContentQueueItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('ai_content_queue')
        .insert(item)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Recargar la cola
      await loadQueue();
      return data;
    } catch (err) {
      console.error('Error creating queue item:', err);
      throw err;
    }
  };

  // Actualizar elemento de la cola
  const updateQueueItem = async (id: string, updates: Partial<AIContentQueueItem>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('ai_content_queue')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Actualizar estado local
      setQueue(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      console.error('Error updating queue item:', err);
      throw err;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadSettings();
    loadQueue();
  }, []);

  return {
    settings,
    queue,
    loading,
    saving,
    error,
    loadSettings,
    loadQueue,
    saveSettings,
    createQueueItem,
    updateQueueItem,
  };
}
