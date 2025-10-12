/**
 * DOCS WELCOME PAGE SCHEMA
 * Página de bienvenida para la documentación multi-idioma
 */

import { defineField, defineType } from 'sanity'
import { HomeIcon, StarIcon } from '@sanity/icons'

export default defineType({
  name: 'docsWelcomePage',
  title: '🏠 Página de Bienvenida Docs',
  type: 'document',
  icon: HomeIcon,
  
  groups: [
    {
      name: 'content',
      title: 'Contenido',
      icon: HomeIcon,
      default: true,
    },
    {
      name: 'quickLinks',
      title: 'Enlaces Rápidos',
      icon: StarIcon,
    },
    {
      name: 'seo',
      title: 'SEO',
      icon: StarIcon,
    },
  ],
  
  fields: [
    // ========== LANGUAGE (Internacionalization) ==========
    defineField({
      name: 'language',
      title: 'Idioma',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    
    // ========== CONTENT GROUP ==========
    defineField({
      name: 'title',
      title: 'Título Principal',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
      description: 'Título de la página de bienvenida',
      group: 'content',
      placeholder: 'Documentación Español',
    }),
    
    defineField({
      name: 'subtitle',
      title: 'Subtítulo',
      type: 'string',
      validation: (Rule) => Rule.max(150),
      description: 'Subtítulo o descripción corta',
      group: 'content',
      placeholder: 'ES',
    }),
    
    defineField({
      name: 'description',
      title: 'Descripción Principal',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
      description: 'Descripción de bienvenida para la documentación',
      group: 'content',
      placeholder: 'Bienvenido a la documentación completa de APIDevs...',
    }),
    
    defineField({
      name: 'heroImage',
      title: 'Imagen Hero',
      type: 'image',
      description: 'Imagen principal de la página de bienvenida',
      group: 'content',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Texto Alternativo',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    
    // ========== QUICK LINKS GROUP ==========
    defineField({
      name: 'quickLinks',
      title: 'Enlaces Rápidos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Título',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Descripción',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.max(200),
            },
            {
              name: 'icon',
              title: 'Icono',
              type: 'string',
              description: 'Emoji o icono',
              placeholder: '🚀',
            },
            {
              name: 'href',
              title: 'Enlace',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Slug del documento (sin /docs/idioma/)',
              placeholder: 'guia-inicio-tradingview',
            },
            {
              name: 'featured',
              title: '¿Destacado?',
              type: 'boolean',
              initialValue: false,
              description: 'Aparece como card principal',
            },
          ],
          preview: {
            select: {
              title: 'title',
              icon: 'icon',
              description: 'description',
              featured: 'featured',
            },
            prepare({ title, icon, description, featured }) {
              return {
                title: `${featured ? '⭐ ' : ''}${icon || '📄'} ${title}`,
                subtitle: description,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).max(6),
      group: 'quickLinks',
    }),
    
    defineField({
      name: 'quickStartTitle',
      title: 'Título Sección Inicio Rápido',
      type: 'string',
      initialValue: 'Comenzar',
      group: 'quickLinks',
    }),
    
    defineField({
      name: 'quickStartIcon',
      title: 'Icono Sección Inicio Rápido',
      type: 'string',
      initialValue: '🚀',
      group: 'quickLinks',
    }),
    
    // ========== SEO GROUP ==========
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Título',
          type: 'string',
          validation: (Rule) => Rule.max(60),
          description: 'Máximo 60 caracteres',
        },
        {
          name: 'metaDescription',
          title: 'Meta Descripción',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: 'Máximo 160 caracteres',
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
          validation: (Rule) => Rule.max(10),
        },
      ],
      group: 'seo',
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      language: 'language',
    },
    prepare({ title, subtitle, language }) {
      const flags = {
        es: '🇪🇸',
        en: '🇺🇸',
      }
      return {
        title: `${flags[language as keyof typeof flags] || '🌐'} ${title}`,
        subtitle: subtitle || `Documentación ${language?.toUpperCase()}`,
      }
    },
  },
  
  orderings: [
    {
      title: 'Por Idioma',
      name: 'languageAsc',
      by: [{ field: 'language', direction: 'asc' }],
    },
  ],
})
