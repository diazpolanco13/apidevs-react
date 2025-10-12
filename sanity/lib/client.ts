import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  perspective: 'published',
})

// Cliente específico para documentación sin perspectiva forzada
export const docsClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Deshabilitar CDN para queries con parámetros
})
