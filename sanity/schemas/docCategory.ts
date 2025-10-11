import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'docCategory',
  title: 'Categorías de Documentación',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Ej: Get started, Organize, Customize'
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
      name: 'icon',
      title: 'Icono',
      type: 'string',
      description: 'Emoji o nombre de icono (ej: 🚀, rocket)'
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Orden en el sidebar',
      validation: (Rule) => Rule.required().min(0)
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 2,
      description: 'Descripción breve de la categoría'
    }),
    defineField({
      name: 'isCollapsible',
      title: '¿Es Colapsable?',
      type: 'boolean',
      initialValue: true,
      description: 'Permite colapsar/expandir la categoría en el sidebar'
    }),
    defineField({
      name: 'defaultExpanded',
      title: 'Expandida por Defecto',
      type: 'boolean',
      initialValue: true,
      description: 'La categoría inicia expandida en el sidebar'
    })
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
      order: 'order'
    },
    prepare({ title, icon, order }) {
      return {
        title: `${order}. ${title}`,
        subtitle: icon || '📂',
        media: undefined
      }
    }
  },
  orderings: [
    {
      title: 'Orden',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ]
})

