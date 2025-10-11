import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'indicator',
  title: 'Indicador',
  type: 'document',
  fields: [
    defineField({
      name: 'pineId',
      title: 'Pine ID',
      type: 'string',
      description: 'ID del indicador en TradingView (formato: PUB;xxxxx). Solo para uso interno.',
      validation: (Rule) => Rule.required(),
      hidden: false,
    }),
    defineField({
      name: 'tradingviewUrl',
      title: 'URL Pública del Script',
      type: 'url',
      description: '🟢 URL pública del script para usuarios (ejemplo: https://www.tradingview.com/script/YIHAWxvw/)',
      validation: (Rule) => Rule.required().uri({
        scheme: ['https']
      }),
    }),
    defineField({
      name: 'embedUrl',
      title: '📊 URL Embed Interactivo (Widget)',
      type: 'url',
      description: 'URL del widget interactivo de TradingView (ejemplo: https://s.tradingview.com/embed/YIHAWxvw/) - Se usa como imagen principal del indicador',
      validation: (Rule) => Rule.uri({
        scheme: ['https']
      }),
    }),
    defineField({
      name: 'slug',
      title: 'Slug URL',
      type: 'slug',
      description: 'URL amigable para el indicador',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Descripción Corta',
      type: 'text',
      rows: 3,
      description: 'Descripción breve para el catálogo (máx 200 caracteres)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagen Principal',
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
    }),
    defineField({
      name: 'gallery',
      title: 'Galería de Imágenes',
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
              title: 'Leyenda',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video de Demostración',
      type: 'url',
      description: 'URL de YouTube, Vimeo u otro servicio',
    }),
    defineField({
      name: 'content',
      title: 'Contenido Detallado',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
          },
        },
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
              title: 'Leyenda',
            },
          ],
        },
        {
          type: 'object',
          name: 'videoEmbed',
          title: 'Video Embebido',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'Video URL',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'features',
      title: 'Características',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Lista de características principales del indicador',
    }),
    defineField({
      name: 'benefits',
      title: 'Beneficios',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Título del Beneficio',
            },
            {
              name: 'description',
              type: 'text',
              title: 'Descripción',
              rows: 3,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'howToUse',
      title: 'Cómo Usar',
      type: 'text',
      rows: 5,
      description: 'Instrucciones de uso del indicador',
    }),
    defineField({
      name: 'faq',
      title: 'Preguntas Frecuentes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'question',
              type: 'string',
              title: 'Pregunta',
            },
            {
              name: 'answer',
              type: 'text',
              title: 'Respuesta',
              rows: 3,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Título',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Descripción',
          rows: 2,
          validation: (Rule) => Rule.max(160),
        },
        {
          name: 'keywords',
          type: 'array',
          title: 'Palabras Clave',
          of: [{ type: 'string' }],
        },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      description: 'Tipo de herramienta',
      options: {
        list: [
          { title: 'Indicador', value: 'indicador' },
          { title: 'Scanner', value: 'scanner' },
          { title: 'Tool', value: 'tool' },
        ],
      },
      initialValue: 'indicador',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'access_tier',
      title: 'Tier de Acceso',
      type: 'string',
      description: 'Nivel de acceso requerido',
      options: {
        list: [
          { title: '🎁 Free', value: 'free' },
          { title: '💎 Premium', value: 'premium' },
        ],
      },
      initialValue: 'free',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      description: 'Estado del indicador',
      options: {
        list: [
          { title: 'Activo', value: 'activo' },
          { title: 'Inactivo', value: 'inactivo' },
          { title: 'En desarrollo', value: 'desarrollo' },
        ],
      },
      initialValue: 'activo',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha de Publicación',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'shortDescription',
      media: 'mainImage',
      category: 'category',
      tier: 'access_tier',
    },
    prepare({ title, subtitle, media, category, tier }) {
      return {
        title,
        subtitle: `${tier === 'premium' ? '💎' : '🎁'} ${category || 'indicador'} - ${subtitle || ''}`,
        media,
      };
    },
  },
});

