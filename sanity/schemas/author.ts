/**
 * AUTHOR SCHEMA - Blog Authors
 * Autores del blog APIDevs
 */

import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export default defineType({
  name: 'author',
  title: '👤 Autores',
  type: 'document',
  icon: UserIcon,
  
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre Completo',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
      description: 'Nombre del autor',
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug URL',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
      description: '🔗 URL del perfil del autor',
    }),
    
    defineField({
      name: 'bio',
      title: 'Biografía',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.max(300),
      description: 'Biografía corta del autor (máx 300 caracteres)',
    }),
    
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto Alternativo',
        },
      ],
      description: '📸 Foto del autor (cuadrada recomendada)',
    }),
    
    defineField({
      name: 'role',
      title: 'Rol / Cargo',
      type: 'string',
      description: 'Ej: "Trader Profesional", "Analista Técnico", "CEO APIDevs"',
      placeholder: 'Trader Profesional',
    }),
    
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          { name: 'email' }
        ).error('Debe ser un email válido'),
      description: '📧 Email de contacto (opcional)',
    }),
    
    defineField({
      name: 'social',
      title: 'Redes Sociales',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'twitter',
          type: 'url',
          title: '🐦 Twitter / X',
          description: 'URL completa (https://twitter.com/username)',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https'],
            }),
        },
        {
          name: 'linkedin',
          type: 'url',
          title: '💼 LinkedIn',
          description: 'URL completa',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https'],
            }),
        },
        {
          name: 'tradingview',
          type: 'url',
          title: '📊 TradingView',
          description: 'URL del perfil en TradingView',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https'],
            }),
        },
        {
          name: 'website',
          type: 'url',
          title: '🌐 Website Personal',
          description: 'URL completa',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https'],
            }),
        },
      ],
    }),
    
    defineField({
      name: 'expertise',
      title: 'Áreas de Expertise',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: '🎯 Ej: Trading, Análisis Técnico, Criptomonedas, Forex',
      validation: (Rule) => Rule.max(8),
    }),
    
    defineField({
      name: 'featured',
      title: '⭐ Autor Destacado',
      type: 'boolean',
      initialValue: false,
      description: 'Mostrar en la página de autores',
    }),
    
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: '✅ Activo', value: 'active' },
          { title: '🔒 Inactivo', value: 'inactive' },
          { title: '👤 Invitado', value: 'guest' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    }),
  ],
  
  preview: {
    select: {
      name: 'name',
      role: 'role',
      avatar: 'avatar',
      status: 'status',
      featured: 'featured',
    },
    prepare({ name, role, avatar, status, featured }) {
      const statusIcons: Record<string, string> = {
        active: '✅',
        inactive: '🔒',
        guest: '👤',
      }
      
      const featuredBadge = featured ? '⭐ ' : ''
      
      return {
        title: `${featuredBadge}${name}`,
        subtitle: `${statusIcons[status] || ''} ${role || 'Autor'}`,
        media: avatar,
      }
    },
  },
  
  orderings: [
    {
      title: 'Nombre (A-Z)',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Destacados Primero',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'name', direction: 'asc' },
      ],
    },
  ],
})

