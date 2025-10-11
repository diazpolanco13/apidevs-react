import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId } from '@/sanity/env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Para ISR con revalidacion
  token: process.env.SANITY_API_TOKEN,
});

// Helper para generar URLs de imagenes
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Cliente para escribir (solo backend)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

