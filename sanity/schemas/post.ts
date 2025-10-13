/**
 * POST SCHEMA - Blog Posts
 * Artículos del blog APIDevs (inspirado en LuxAlgo)
 */

import { defineField, defineType } from 'sanity'
import { DocumentTextIcon, LinkIcon, CogIcon, TagIcon, ImageIcon } from '@sanity/icons'

export default defineType({
  name: 'post',
  title: '📝 Blog Posts',
  type: 'document',
  icon: DocumentTextIcon,
  
  groups: [
    {
      name: 'content',
      title: 'Contenido',
      icon: DocumentTextIcon,
      default: true,
    },
    {
      name: 'media',
      title: 'Medios',
      icon: ImageIcon,
    },
    {
      name: 'metadata',
      title: 'Metadata',
      icon: CogIcon,
    },
    {
      name: 'seo',
      title: 'SEO',
      icon: TagIcon,
    },
  ],
  
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
      group: 'metadata',
    }),
    
    // ========== CONTENT GROUP ==========
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
      description: 'Título del artículo (máx 150 caracteres)',
      group: 'content',
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug URL',
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
      validation: (Rule) =>
        Rule.required().custom((slug) => {
          if (!slug?.current) return true
          if (slug.current.startsWith('-') || slug.current.endsWith('-')) {
            return 'El slug no puede comenzar ni terminar con guion'
          }
          if (slug.current.includes('--')) {
            return 'El slug no puede contener guiones dobles'
          }
          return true
        }),
      group: 'content',
    }),
    
    defineField({
      name: 'excerpt',
      title: 'Excerpt / Resumen',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(50).max(250),
      description: '📝 Resumen corto para cards (50-250 caracteres). Muy importante para SEO y preview.',
      group: 'content',
    }),
    
    defineField({
      name: 'content',
      title: 'Contenido Principal',
      type: 'array',
      of: [
        // BLOCK (Texto enriquecido)
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
            { title: 'Checkbox', value: 'checkbox' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
              { title: 'Highlight', value: 'highlight' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                icon: LinkIcon,
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Abrir en nueva pestaña',
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        
        // IMAGE
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texto Alternativo',
              description: '♿ Importante para SEO y accesibilidad',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Texto que aparece debajo de la imagen',
            },
          ],
        },
        
        // CODE BLOCK (reutilizando de docs)
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Code Block',
          icon: () => '💻',
          fields: [
            {
              name: 'filename',
              title: 'Nombre del Archivo',
              type: 'string',
              description: '📄 Ej: app/page.tsx, config.json',
              placeholder: 'app/page.tsx',
            },
            {
              name: 'language',
              title: 'Lenguaje',
              type: 'string',
              options: {
                list: [
                  { title: 'TypeScript', value: 'typescript' },
                  { title: 'JavaScript', value: 'javascript' },
                  { title: 'Python', value: 'python' },
                  { title: 'Bash', value: 'bash' },
                  { title: 'JSON', value: 'json' },
                  { title: 'CSS', value: 'css' },
                  { title: 'HTML', value: 'html' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'typescript',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'code',
              title: 'Código',
              type: 'text',
              rows: 15,
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'showLineNumbers',
              title: 'Mostrar Números de Línea',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              code: 'code',
              language: 'language',
              filename: 'filename',
            },
            prepare({ code, language, filename }) {
              return {
                title: filename || `${language} code`,
                subtitle: code?.substring(0, 60) + (code?.length > 60 ? '...' : ''),
                media: () => '💻',
              }
            },
          },
        },
        
        // CALLOUT (reutilizando de docs)
        {
          type: 'object',
          name: 'callout',
          title: '💡 Callout',
          fields: [
            {
              name: 'type',
              title: 'Tipo',
              type: 'string',
              options: {
                list: [
                  { title: '💡 Info', value: 'info' },
                  { title: '✅ Success', value: 'success' },
                  { title: '⚠️ Warning', value: 'warning' },
                  { title: '🚨 Error', value: 'error' },
                  { title: '📝 Note', value: 'note' },
                  { title: '💡 Tip', value: 'tip' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'info',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'title',
              title: 'Título',
              type: 'string',
              description: 'Título del callout (opcional)',
            },
            {
              name: 'content',
              title: 'Contenido',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              type: 'type',
              title: 'title',
              content: 'content',
            },
            prepare({ type, title, content }) {
              const icons: Record<string, string> = {
                info: '💡',
                success: '✅',
                warning: '⚠️',
                error: '🚨',
                note: '📝',
                tip: '💡',
              }
              return {
                title: title || type.toUpperCase(),
                subtitle: content?.substring(0, 60) + (content?.length > 60 ? '...' : ''),
                media: () => icons[type] || '💡',
              }
            },
          },
        },
        
        // VIDEO EMBED
        {
          type: 'object',
          name: 'videoEmbed',
          title: '🎥 Video',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'URL del Video',
              description: 'YouTube, Vimeo, Loom, etc.',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'title',
              type: 'string',
              title: 'Título',
            },
            {
              name: 'aspectRatio',
              type: 'string',
              title: 'Aspect Ratio',
              options: {
                list: [
                  { title: '16:9 (Landscape)', value: '16:9' },
                  { title: '4:3', value: '4:3' },
                  { title: '1:1 (Square)', value: '1:1' },
                  { title: '9:16 (Portrait)', value: '9:16' },
                ],
              },
              initialValue: '16:9',
            },
          ],
          preview: {
            select: {
              url: 'url',
              title: 'title',
            },
            prepare({ url, title }) {
              return {
                title: title || 'Video',
                subtitle: url,
                media: () => '🎥',
              }
            },
          },
        },
        
        // CARD GROUP (de docs)
        {
          type: 'object',
          name: 'cardGroup',
          title: '🃏 Card Group',
          fields: [
            {
              name: 'title',
              title: 'Título del Grupo',
              type: 'string',
            },
            {
              name: 'cols',
              title: 'Columnas',
              type: 'number',
              options: {
                list: [
                  { title: '1 columna', value: 1 },
                  { title: '2 columnas', value: 2 },
                  { title: '3 columnas', value: 3 },
                  { title: '4 columnas', value: 4 },
                ],
              },
              initialValue: 2,
              validation: (Rule) => Rule.required().min(1).max(4),
            },
            {
              name: 'cards',
              title: 'Cards',
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
                      description: 'Emoji del card',
                    },
                    {
                      name: 'description',
                      type: 'text',
                      title: 'Descripción',
                      rows: 2,
                    },
                    {
                      name: 'href',
                      type: 'string',
                      title: 'Link',
                      description: 'URL o slug (/blog/otro-articulo)',
                    },
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      icon: 'icon',
                      description: 'description',
                    },
                    prepare({ title, icon, description }) {
                      return {
                        title: `${icon || '📄'} ${title}`,
                        subtitle: description,
                      }
                    },
                  },
                },
              ],
              validation: (Rule) => Rule.min(1).max(12),
            },
          ],
          preview: {
            select: {
              title: 'title',
              cols: 'cols',
              cards: 'cards',
            },
            prepare({ title, cols, cards }) {
              return {
                title: title || 'Card Group',
                subtitle: `${cols} cols × ${cards?.length || 0} cards`,
                media: () => '🃏',
              }
            },
          },
        },
        
        // TABS (de docs)
        {
          type: 'object',
          name: 'tabs',
          title: '📑 Tabs',
          fields: [
            {
              name: 'items',
              title: 'Tabs',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'label',
                      type: 'string',
                      title: 'Label',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'content',
                      type: 'text',
                      title: 'Contenido',
                      rows: 6,
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  preview: {
                    select: {
                      label: 'label',
                      content: 'content',
                    },
                    prepare({ label, content }) {
                      return {
                        title: label,
                        subtitle: content?.substring(0, 60) + '...',
                      }
                    },
                  },
                },
              ],
              validation: (Rule) => Rule.min(2).max(8),
            },
          ],
          preview: {
            select: {
              items: 'items',
            },
            prepare({ items }) {
              return {
                title: 'Tabs',
                subtitle: `${items?.length || 0} tabs`,
                media: () => '📑',
              }
            },
          },
        },
        
        // ACCORDION (de docs)
        {
          type: 'object',
          name: 'accordion',
          title: '📋 Accordion',
          fields: [
            {
              name: 'title',
              title: 'Título',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              type: 'text',
              title: 'Contenido',
              rows: 4,
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'defaultOpen',
              title: 'Abierto por Defecto',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: 'title',
              content: 'content',
            },
            prepare({ title, content }) {
              return {
                title,
                subtitle: content?.substring(0, 60) + '...',
                media: () => '📋',
              }
            },
          },
        },
      ],
      group: 'content',
    }),
    
    // ========== MEDIA GROUP ==========
    defineField({
      name: 'mainImage',
      title: 'Imagen Principal (Featured)',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto Alternativo',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      validation: (Rule) => Rule.required(),
      description: '🖼️ Imagen destacada del artículo. Recomendado: 1200x630px para redes sociales.',
      group: 'media',
    }),
    
    defineField({
      name: 'gallery',
      title: 'Galería Adicional',
      type: 'array',
      of: [
        {
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
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      description: '📸 Imágenes adicionales para el artículo',
      validation: (Rule) => Rule.max(10),
      group: 'media',
    }),
    
    // ========== METADATA GROUP ==========
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
      description: '👤 Autor del artículo',
      group: 'metadata',
    }),
    
    defineField({
      name: 'categories',
      title: 'Categorías',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'blogCategory' }] }],
      validation: (Rule) => Rule.required().min(1).max(3),
      description: '🏷️ Mínimo 1, máximo 3 categorías',
      group: 'metadata',
    }),
    
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      validation: (Rule) => Rule.max(10),
      description: '🏷️ Tags para búsqueda y filtrado (máx 10)',
      group: 'metadata',
    }),
    
    defineField({
      name: 'publishedAt',
      title: 'Fecha de Publicación',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
      description: '📅 Fecha visible en el artículo',
      group: 'metadata',
    }),
    
    defineField({
      name: 'updatedAt',
      title: 'Última Actualización',
      type: 'datetime',
      description: '🔄 Se actualiza automáticamente',
      group: 'metadata',
    }),
    
    defineField({
      name: 'readingTime',
      title: 'Tiempo de Lectura',
      type: 'number',
      description: '⏱️ Minutos estimados de lectura (se puede calcular automáticamente)',
      validation: (Rule) => Rule.min(1).max(60),
      group: 'metadata',
    }),
    
    defineField({
      name: 'featured',
      title: '⭐ Post Destacado',
      type: 'boolean',
      initialValue: false,
      description: 'Aparece en el hero de la homepage del blog',
      group: 'metadata',
    }),
    
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: '✅ Publicado', value: 'published' },
          { title: '🚧 Borrador', value: 'draft' },
          { title: '👀 En Revisión', value: 'review' },
          { title: '📅 Programado', value: 'scheduled' },
          { title: '🗄️ Archivado', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
      group: 'metadata',
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
      description: 'Control de acceso al artículo',
      group: 'metadata',
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
          description: '🎯 Máximo 60 caracteres. Si está vacío, usa el título principal',
        },
        {
          name: 'metaDescription',
          title: 'Meta Descripción',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: '📝 Máximo 160 caracteres. Si está vacío, usa el excerpt',
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
          description: '🏷️ Máximo 10 keywords',
        },
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          description: '🖼️ Imagen para redes sociales (si está vacío, usa mainImage)',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'noindex',
          title: 'No Indexar',
          type: 'boolean',
          initialValue: false,
          description: '🚫 Excluir de motores de búsqueda',
        },
      ],
      group: 'seo',
    }),
    
    // ========== RELATED CONTENT ==========
    defineField({
      name: 'relatedPosts',
      title: 'Posts Relacionados',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      validation: (Rule) => Rule.max(4),
      description: '🔗 Posts relacionados que aparecen al final del artículo (máx 4)',
      group: 'metadata',
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      mainImage: 'mainImage',
      status: 'status',
      featured: 'featured',
      publishedAt: 'publishedAt',
      language: 'language',
    },
    prepare({ title, author, mainImage, status, featured, publishedAt, language }) {
      const statusIcons: Record<string, string> = {
        published: '✅',
        draft: '🚧',
        review: '👀',
        scheduled: '📅',
        archived: '🗄️',
      }
      
      const featuredBadge = featured ? '⭐ ' : ''
      const langFlag = language === 'es' ? '🇪🇸 ' : '🇺🇸 '
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('es-ES') : ''
      
      return {
        title: `${featuredBadge}${langFlag}${title}`,
        subtitle: `${statusIcons[status] || ''} ${author || 'Sin autor'} · ${date}`,
        media: mainImage,
      }
    },
  },
  
  orderings: [
    {
      title: 'Fecha de Publicación (Recientes)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Fecha de Publicación (Antiguos)',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
    {
      title: 'Última Actualización',
      name: 'updatedAtDesc',
      by: [{ field: 'updatedAt', direction: 'desc' }],
    },
    {
      title: 'Destacados Primero',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
    {
      title: 'Alfabético',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})

