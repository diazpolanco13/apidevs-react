'use server';

import { docsClient } from '@/sanity/lib/client';
import { DOC_TRANSLATIONS_QUERY } from '@/sanity/lib/doc-queries';

/**
 * Obtiene el slug del documento traducido al idioma especificado
 * @param currentDocId - ID del documento actual
 * @param targetLanguage - Idioma objetivo (es, en)
 * @returns Slug del documento traducido o null si no existe
 */
export async function getTranslatedSlug(
  currentDocId: string,
  targetLanguage: string
): Promise<string | null> {
  try {
    const translations = await docsClient.fetch(DOC_TRANSLATIONS_QUERY, {
      docId: currentDocId
    });

    if (!translations || !translations.translations) {
      return null;
    }

    // Buscar el documento en el idioma objetivo
    const targetDoc = translations.translations.find(
      (t: any) => t._key === targetLanguage && t.doc
    );

    return targetDoc?.doc?.slug || null;
  } catch (error) {
    console.error('Error fetching translated slug:', error);
    return null;
  }
}

