/**
 * DOCUMENTATION SCHEMA - Mintlify Style
 * Sistema de documentación profesional tipo Mintlify
 */

import { defineField, defineType } from 'sanity'
import { DocumentTextIcon, LinkIcon, CogIcon, TagIcon } from '@sanity/icons'

export default defineType({
  name: 'documentation',
  title: '📚 Documentación',
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
      name: 'navigation',
      title: 'Navegación',
      icon: LinkIcon,
    },
    {
      name: 'settings',
      title: 'Configuración',
      icon: CogIcon,
    },
    {
      name: 'seo',
      title: 'SEO',
      icon: TagIcon,
    },
  ],
  
  fields: [
    // ========== CONTENT GROUP ==========
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
      description: 'Título principal de la página',
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
      name: 'description',
      title: 'Descripción Corta',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
      description: '💡 Aparece en el sidebar y en cards de navegación (máx 200 caracteres)',
      group: 'content',
    }),
    
    defineField({
      name: 'icon',
      title: 'Icono',
      type: 'string',
      description: '🎨 Emoji que aparece junto al título (ej: 🚀, ⚡, 📊)',
      placeholder: '🚀',
      validation: (Rule) =>
        Rule.max(4).custom((value) => {
          if (!value) return true
          // Validar que sea un emoji válido (simplified regex sin flag u)
          if (value.length > 4) {
            return 'Debe ser un emoji válido'
          }
          return true
        }),
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
            { title: 'H1', value: 'h1' },
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
                    initialValue: false,
                  },
                ],
              },
              {
                name: 'internalLink',
                type: 'object',
                title: 'Link Interno',
                fields: [
                  {
                    name: 'reference',
                    type: 'reference',
                    to: [{ type: 'documentation' }],
                    title: 'Página',
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
        
        // CODE BLOCK (Mintlify style)
        {
          type: 'object',
          name: 'codeBlock',
          title: '💻 Code Block',
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
                  { title: 'JSX', value: 'jsx' },
                  { title: 'TSX', value: 'tsx' },
                  { title: 'Python', value: 'python' },
                  { title: 'Bash', value: 'bash' },
                  { title: 'Shell', value: 'sh' },
                  { title: 'JSON', value: 'json' },
                  { title: 'YAML', value: 'yaml' },
                  { title: 'CSS', value: 'css' },
                  { title: 'SCSS', value: 'scss' },
                  { title: 'HTML', value: 'html' },
                  { title: 'SQL', value: 'sql' },
                  { title: 'GraphQL', value: 'graphql' },
                  { title: 'Markdown', value: 'markdown' },
                  { title: 'Go', value: 'go' },
                  { title: 'Rust', value: 'rust' },
                  { title: 'PHP', value: 'php' },
                  { title: 'Ruby', value: 'ruby' },
                  { title: 'Java', value: 'java' },
                  { title: 'C++', value: 'cpp' },
                  { title: 'C#', value: 'csharp' },
                  { title: 'Swift', value: 'swift' },
                  { title: 'Kotlin', value: 'kotlin' },
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
              name: 'highlightLines',
              title: 'Líneas Resaltadas',
              type: 'string',
              description: '✨ Ej: 1-3,5,7-10 (resalta esas líneas)',
              placeholder: '1-3,5,7-10',
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
        
        // CALLOUT (Mintlify style)
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
                  { title: '🎓 Learn', value: 'learn' },
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
            {
              name: 'collapsible',
              title: '¿Es Colapsable?',
              type: 'boolean',
              initialValue: false,
              description: 'Permite colapsar/expandir el contenido',
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
                learn: '🎓',
              }
              return {
                title: title || type.toUpperCase(),
                subtitle: content?.substring(0, 60) + (content?.length > 60 ? '...' : ''),
                media: () => icons[type] || '💡',
              }
            },
          },
        },
        
        // CARD GROUP (Mintlify style)
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
                      description: 'URL o slug (/docs/getting-started)',
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
        
        // TABS (Mintlify style)
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
        
        // ACCORDION (Mintlify style)
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
      ],
      group: 'content',
    }),
    
    // ========== NAVIGATION GROUP ==========
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      to: [{ type: 'docCategory' }],
      validation: (Rule) => Rule.required(),
      description: '📂 Categoría en el sidebar',
      group: 'navigation',
    }),
    
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: '🔢 Orden dentro de su categoría (menor = arriba)',
      validation: (Rule) => Rule.required().min(0).max(999),
      initialValue: 0,
      group: 'navigation',
    }),
    
    defineField({
      name: 'previousPage',
      title: 'Página Anterior',
      type: 'reference',
      to: [{ type: 'documentation' }],
      description: '← Navegación secuencial',
      group: 'navigation',
    }),
    
    defineField({
      name: 'nextPage',
      title: 'Página Siguiente',
      type: 'reference',
      to: [{ type: 'documentation' }],
      description: '→ Navegación secuencial',
      group: 'navigation',
    }),
    
    defineField({
      name: 'relatedPages',
      title: 'Páginas Relacionadas',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'documentation' }] }],
      description: '🔗 Sugerencias al final de la página',
      validation: (Rule) => Rule.max(6),
      group: 'navigation',
    }),
    
    // ========== SETTINGS GROUP ==========
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: '✅ Publicado', value: 'published' },
          { title: '🚧 En Progreso', value: 'draft' },
          { title: '👀 En Revisión', value: 'review' },
          { title: '🗄️ Archivado', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
      group: 'settings',
    }),
    
    defineField({
      name: 'featured',
      title: '⭐ Destacado',
      type: 'boolean',
      initialValue: false,
      description: 'Aparece en la página principal de docs',
      group: 'settings',
    }),
    
    defineField({
      name: 'publishedAt',
      title: 'Fecha de Publicación',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      group: 'settings',
    }),
    
    defineField({
      name: 'updatedAt',
      title: 'Última Actualización',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      group: 'settings',
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
          validation: (Rule) =>
            Rule.max(60).custom((value, context) => {
              const title = (context.parent as any)?.title || (context.document as any)?.title
              if (!value && !title) {
                return 'Se requiere un título o meta título'
              }
              return true
            }),
          description: '🎯 Máximo 60 caracteres. Si está vacío, usa el título principal',
        },
        {
          name: 'metaDescription',
          title: 'Meta Descripción',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: '📝 Máximo 160 caracteres',
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
          description: '🖼️ Imagen para redes sociales (1200×630px recomendado)',
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
  ],
  
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      order: 'order',
      icon: 'icon',
      status: 'status',
    },
    prepare({ title, category, order, icon, status }) {
      const statusIcons: Record<string, string> = {
        published: '✅',
        draft: '🚧',
        review: '👀',
        archived: '🗄️',
      }
      return {
        title: `${icon || '📄'} ${title}`,
        subtitle: `${statusIcons[status] || ''} ${category || 'Sin categoría'} · Orden: ${order || 0}`,
      }
    },
  },
  
  orderings: [
    {
      title: 'Orden (Ascendente)',
      name: 'orderAsc',
      by: [
        { field: 'category._ref', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
    {
      title: 'Fecha de Publicación',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Última Actualización',
      name: 'updatedAtDesc',
      by: [{ field: 'updatedAt', direction: 'desc' }],
    },
  ],
})
