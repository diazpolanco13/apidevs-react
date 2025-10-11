import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'documentation',
  title: 'Documentación',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Título de la página de documentación'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      to: [{ type: 'docCategory' }],
      validation: (Rule) => Rule.required(),
      description: 'Categoría a la que pertenece esta página'
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Orden dentro de su categoría',
      validation: (Rule) => Rule.required().min(0)
    }),
    defineField({
      name: 'icon',
      title: 'Icono',
      type: 'string',
      description: 'Emoji o nombre de icono (opcional)'
    }),
    defineField({
      name: 'description',
      title: 'Descripción Corta',
      type: 'text',
      rows: 2,
      description: 'Descripción breve que aparece en el sidebar'
    }),
    defineField({
      name: 'content',
      title: 'Contenido',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ['http', 'https', 'mailto', 'tel']
                      })
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Abrir en nueva pestaña',
                    initialValue: false
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texto Alternativo',
              description: 'Importante para SEO y accesibilidad'
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Texto que aparece debajo de la imagen'
            }
          ]
        },
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Bloque de Código',
          fields: [
            {
              name: 'language',
              title: 'Lenguaje',
              type: 'string',
              options: {
                list: [
                  { title: 'JavaScript', value: 'javascript' },
                  { title: 'TypeScript', value: 'typescript' },
                  { title: 'JSX', value: 'jsx' },
                  { title: 'TSX', value: 'tsx' },
                  { title: 'Python', value: 'python' },
                  { title: 'Bash', value: 'bash' },
                  { title: 'Shell', value: 'sh' },
                  { title: 'JSON', value: 'json' },
                  { title: 'CSS', value: 'css' },
                  { title: 'HTML', value: 'html' },
                  { title: 'SQL', value: 'sql' },
                  { title: 'GraphQL', value: 'graphql' }
                ]
              },
              initialValue: 'typescript'
            },
            {
              name: 'filename',
              title: 'Nombre del archivo',
              type: 'string',
              description: 'Opcional: ejemplo.ts, config.json'
            },
            {
              name: 'code',
              title: 'Código',
              type: 'text',
              rows: 10,
              validation: (Rule) => Rule.required()
            }
          ],
          preview: {
            select: {
              code: 'code',
              language: 'language',
              filename: 'filename'
            },
            prepare({ code, language, filename }) {
              return {
                title: filename || `${language} code`,
                subtitle: code?.substring(0, 60) + '...'
              }
            }
          }
        },
        {
          type: 'object',
          name: 'callout',
          title: 'Callout',
          fields: [
            {
              name: 'type',
              title: 'Tipo',
              type: 'string',
              options: {
                list: [
                  { title: '💡 Info', value: 'info' },
                  { title: '⚠️ Warning', value: 'warning' },
                  { title: '🚨 Error', value: 'error' },
                  { title: '✅ Success', value: 'success' },
                  { title: '📝 Note', value: 'note' }
                ],
                layout: 'radio'
              },
              initialValue: 'info',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'title',
              title: 'Título',
              type: 'string',
              description: 'Título del callout (opcional)'
            },
            {
              name: 'content',
              title: 'Contenido',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required()
            }
          ],
          preview: {
            select: {
              type: 'type',
              title: 'title',
              content: 'content'
            },
            prepare({ type, title, content }) {
              const icons: Record<string, string> = {
                info: '💡',
                warning: '⚠️',
                error: '🚨',
                success: '✅',
                note: '📝'
              }
              return {
                title: title || type.toUpperCase(),
                subtitle: content?.substring(0, 60) + '...',
                media: undefined,
                description: icons[type] || '💡'
              }
            }
          }
        }
      ]
    }),
    defineField({
      name: 'nextPage',
      title: 'Página Siguiente',
      type: 'reference',
      to: [{ type: 'documentation' }],
      description: 'Enlace a la siguiente página (navegación secuencial)'
    }),
    defineField({
      name: 'previousPage',
      title: 'Página Anterior',
      type: 'reference',
      to: [{ type: 'documentation' }],
      description: 'Enlace a la página anterior (navegación secuencial)'
    }),
    defineField({
      name: 'relatedPages',
      title: 'Páginas Relacionadas',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'documentation' }] }],
      description: 'Páginas relacionadas que aparecen al final'
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: true
      },
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Título',
          type: 'string',
          validation: (Rule) => Rule.max(60),
          description: 'Máximo 60 caracteres'
        },
        {
          name: 'metaDescription',
          title: 'Meta Descripción',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: 'Máximo 160 caracteres'
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags'
          }
        }
      ]
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha de Publicación',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'updatedAt',
      title: 'Última Actualización',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      order: 'order',
      icon: 'icon'
    },
    prepare({ title, category, order, icon }) {
      return {
        title: `${order}. ${title}`,
        subtitle: `📂 ${category || 'Sin categoría'}`,
        media: undefined,
        description: icon
      }
    }
  },
  orderings: [
    {
      title: 'Orden (Ascendente)',
      name: 'orderAsc',
      by: [
        { field: 'category._ref', direction: 'asc' },
        { field: 'order', direction: 'asc' }
      ]
    },
    {
      title: 'Fecha de Publicación',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    }
  ]
})

