import { defineQuery } from 'next-sanity'

// Query para obtener todos los indicadores publicados
export const INDICATORS_QUERY = defineQuery(`
  *[_type == "indicator"] | order(publishedAt desc) {
    _id,
    _createdAt,
    pineId,
    "slug": slug.current,
    title,
    shortDescription,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    features,
    tags,
    access_tier,
    category,
    status,
    publishedAt
  }
`)

// Query para obtener un indicador por slug
export const INDICATOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "indicator" && slug.current == $slug][0] {
    _id,
    _createdAt,
    pineId,
    tradingviewUrl,
    embedUrl,
    "slug": slug.current,
    title,
    shortDescription,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    gallery[] {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt,
      caption
    },
    videoUrl,
    content,
    features,
    benefits,
    howToUse,
    faq,
    seo,
    tags,
    access_tier,
    category,
    status,
    publishedAt
  }
`)

// Query para obtener indicadores por categoría
export const INDICATORS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "indicator" && category == $category] | order(publishedAt desc) {
    _id,
    pineId,
    "slug": slug.current,
    title,
    shortDescription,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    features,
    tags,
    access_tier,
    category,
    publishedAt
  }
`)

// Query para obtener indicadores por access_tier (free/premium)
export const INDICATORS_BY_TIER_QUERY = defineQuery(`
  *[_type == "indicator" && access_tier == $tier] | order(publishedAt desc) {
    _id,
    pineId,
    "slug": slug.current,
    title,
    shortDescription,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    features,
    tags,
    access_tier,
    category,
    publishedAt
  }
`)

// Query para búsqueda de indicadores
export const SEARCH_INDICATORS_QUERY = defineQuery(`
  *[_type == "indicator" && (
    title match $searchTerm ||
    shortDescription match $searchTerm ||
    $searchTerm in tags
  )] | order(publishedAt desc) {
    _id,
    pineId,
    "slug": slug.current,
    title,
    shortDescription,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    features,
    tags,
    access_tier,
    category,
    publishedAt
  }
`)

// Query para obtener slugs de todos los indicadores (para generateStaticParams)
export const INDICATOR_SLUGS_QUERY = defineQuery(`
  *[_type == "indicator" && defined(slug.current)][].slug.current
`)

// Types para TypeScript
export type IndicatorListItem = {
  _id: string
  _createdAt?: string
  pineId: string
  slug: string
  title: string
  shortDescription: string
  mainImage?: {
    asset: {
      _id: string
      url: string
      metadata: {
        lqip?: string
        dimensions: {
          width: number
          height: number
        }
      }
    }
    alt?: string
  }
  features?: string[]
  tags?: string[]
  access_tier: 'free' | 'premium'
  category: string
  status?: string
  publishedAt?: string
}

export type IndicatorDetail = IndicatorListItem & {
  tradingviewUrl?: string
  embedUrl?: string
  gallery?: Array<{
    asset: {
      _id: string
      url: string
      metadata: {
        lqip?: string
        dimensions: {
          width: number
          height: number
        }
      }
    }
    alt?: string
    caption?: string
  }>
  videoUrl?: string
  content?: any[] // Portable Text
  benefits?: Array<{
    title: string
    description: string
  }>
  howToUse?: string
  faq?: Array<{
    question: string
    answer: string
  }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

