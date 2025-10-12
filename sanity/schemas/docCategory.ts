/**
 * DOC CATEGORY SCHEMA - Mintlify Style
 * Categorías para organizar la documentación en sidebar
 */

import { defineField, defineType } from 'sanity'
import { FolderIcon, TagIcon } from '@sanity/icons'

export default defineType({
  name: 'docCategory',
  title: '📂 Categorías de Documentación',
  type: 'document',
  icon: FolderIcon,
  
  fields: [
    // ========== LANGUAGE (Internacionalization) ==========
    defineField({
      name: 'language',
      title: 'Idioma',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required().max(50),
      description: '📌 Nombre de la categoría (ej: Getting Started, API Reference, Guides)',
      placeholder: 'Getting Started',
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
      name: 'icon',
      title: 'Icono',
      type: 'string',
      description: '🎨 Emoji que aparece en el sidebar (ej: 🚀, 📚, ⚙️)',
      placeholder: '📚',
      validation: (Rule) =>
        Rule.max(4).custom((value) => {
          if (!value) return true
          // Validar que sea un emoji válido (simplified regex sin flag u)
          if (value.length > 4) {
            return 'Debe ser un emoji válido'
          }
          return true
        }),
    }),
    
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: '🔢 Orden en el sidebar (menor = arriba)',
      validation: (Rule) => Rule.required().min(0).max(999),
      initialValue: 0,
    }),
    
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 2,
      description: '💬 Descripción breve de la categoría',
      validation: (Rule) => Rule.max(200),
    }),
    
    defineField({
      name: 'isCollapsible',
      title: '¿Es Colapsable?',
      type: 'boolean',
      initialValue: true,
      description: '🔽 Permite colapsar/expandir la categoría en el sidebar',
    }),
    
    defineField({
      name: 'defaultExpanded',
      title: 'Expandida por Defecto',
      type: 'boolean',
      initialValue: true,
      description: '👀 La categoría inicia expandida cuando es colapsable',
    }),
    
    defineField({
      name: 'color',
      title: 'Color de Acento',
      type: 'string',
      description: '🎨 Color hex para identificación visual (opcional)',
      options: {
        list: [
          { title: '🟢 APIDevs Primary (#C9D92E)', value: '#C9D92E' },
          { title: '🟣 Purple (#9333EA)', value: '#9333EA' },
          { title: '🔵 Blue (#3B82F6)', value: '#3B82F6' },
          { title: '🟢 Green (#10B981)', value: '#10B981' },
          { title: '🟡 Yellow (#F59E0B)', value: '#F59E0B' },
          { title: '🔴 Red (#EF4444)', value: '#EF4444' },
          { title: '⚪ Gray (#6B7280)', value: '#6B7280' },
        ],
      },
      initialValue: '#C9D92E',
    }),
    
    defineField({
      name: 'featured',
      title: '⭐ Destacado',
      type: 'boolean',
      initialValue: false,
      description: 'Aparece en la página principal de documentación',
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
          { title: '🚧 Oculto', value: 'hidden' },
        ],
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
      description: 'Control de acceso para esta categoría',
    }),
    
    defineField({
      name: 'quickLinks',
      title: 'Quick Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Título',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'icon',
              type: 'string',
              title: 'Icono',
              description: 'Emoji',
            },
            {
              name: 'href',
              type: 'string',
              title: 'Link',
              validation: (Rule) => Rule.required(),
              description: 'URL o slug (/docs/getting-started)',
            },
            {
              name: 'description',
              type: 'text',
              title: 'Descripción',
              rows: 2,
            },
          ],
          preview: {
            select: {
              title: 'title',
              icon: 'icon',
              href: 'href',
            },
            prepare({ title, icon, href }) {
              return {
                title: `${icon || '🔗'} ${title}`,
                subtitle: href,
              }
            },
          },
        },
      ],
      description: '⚡ Links rápidos que aparecen en la categoría',
      validation: (Rule) => Rule.max(6),
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
      order: 'order',
      visibility: 'visibility',
      featured: 'featured',
    },
    prepare({ title, icon, order, visibility, featured }) {
      const visibilityIcons: Record<string, string> = {
        public: '👁️',
        authenticated: '🔒',
        premium: '💎',
        hidden: '🚧',
      }
      
      const featuredBadge = featured ? '⭐ ' : ''
      
      return {
        title: `${featuredBadge}${icon || '📂'} ${title}`,
        subtitle: `${visibilityIcons[visibility] || ''} ${visibility} · Orden: ${order || 0}`,
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
