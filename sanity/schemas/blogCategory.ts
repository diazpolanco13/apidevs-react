/**
 * BLOG CATEGORY SCHEMA
 * Categorías para organizar el blog
 */

import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export default defineType({
  name: 'blogCategory',
  title: '🏷️ Categorías de Blog',
  type: 'document',
  icon: TagIcon,
  
  fields: [
    // ========== LANGUAGE (Internacionalization) ==========
    defineField({
      name: 'language',
      title: 'Idioma',
      type: 'string',
      options: {
        list: [
          { title: '🇪🇸 Español', value: 'es' },
          { title: '🇺🇸 English', value: 'en' }
        ]
      },
      initialValue: 'es',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required().max(50),
      description: '📌 Nombre de la categoría',
      placeholder: 'Análisis de Mercado',
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
      description: '🔗 URL amigable',
    }),
    
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
      description: '💬 Descripción breve de la categoría (máx 200 caracteres)',
    }),
    
    defineField({
      name: 'icon',
      title: 'Icono',
      type: 'string',
      description: '🎨 Emoji para la categoría (ej: 📊, 💡, 🚀)',
      placeholder: '📊',
      validation: (Rule) =>
        Rule.max(4).custom((value) => {
          if (!value) return true
          if (value.length > 4) {
            return 'Debe ser un emoji válido'
          }
          return true
        }),
    }),
    
    defineField({
      name: 'color',
      title: 'Color de Acento',
      type: 'string',
      description: '🎨 Color para identificación visual',
      options: {
        list: [
          { title: '🟢 APIDevs Primary (#C9D92E)', value: 'primary' },
          { title: '🟣 Purple (#9333EA)', value: 'purple' },
          { title: '🔵 Blue (#3B82F6)', value: 'blue' },
          { title: '🟢 Green (#10B981)', value: 'green' },
          { title: '🟡 Yellow (#F59E0B)', value: 'yellow' },
          { title: '🔴 Red (#EF4444)', value: 'red' },
          { title: '⚪ Gray (#6B7280)', value: 'gray' },
        ],
      },
      initialValue: 'primary',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: '🔢 Orden de visualización (menor = primero)',
      validation: (Rule) => Rule.required().min(0).max(999),
      initialValue: 0,
    }),
    
    defineField({
      name: 'featured',
      title: '⭐ Destacado',
      type: 'boolean',
      initialValue: false,
      description: 'Aparece en la página principal del blog',
    }),
    
    defineField({
      name: 'visibility',
      title: 'Visibilidad',
      type: 'string',
      options: {
        list: [
          { title: '👁️ Público', value: 'public' },
          { title: '🔒 Solo Autenticados', value: 'authenticated' },
          { title: '💎 Solo Premium', value: 'premium' },
        ],
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
      order: 'order',
      featured: 'featured',
      language: 'language',
    },
    prepare({ title, icon, order, featured, language }) {
      const featuredBadge = featured ? '⭐ ' : ''
      const langFlag = language === 'es' ? '🇪🇸 ' : '🇺🇸 '
      
      return {
        title: `${featuredBadge}${langFlag}${icon || '🏷️'} ${title}`,
        subtitle: `Orden: ${order || 0}`,
      }
    },
  },
  
  orderings: [
    {
      title: 'Orden (Ascendente)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Alfabético',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})

