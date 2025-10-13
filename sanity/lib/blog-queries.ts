/**
 * BLOG QUERIES - GROQ
 * Queries optimizadas para el blog de APIDevs
 */

import { defineQuery } from 'next-sanity'

// ========== POSTS QUERIES ==========

/**
 * Query para obtener todos los posts publicados
 * Con paginación y filtro por idioma
 */
export const BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && language == $language] | order(publishedAt desc) [0...$limit] {
    _id,
    _createdAt,
    "slug": slug.current,
    title,
    excerpt,
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
      alt,
      caption
    },
    author-> {
      _id,
      name,
      "slug": slug.current,
      role,
      avatar {
        asset-> {
          _id,
          url
        }
      }
    },
    categories[]-> {
      _id,
      title,
      "slug": slug.current,
      color,
      icon
    },
    tags,
    publishedAt,
    readingTime,
    featured
  }
`)

/**
 * Query para obtener posts destacados (featured)
 */
export const FEATURED_POSTS_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && featured == true && language == $language] | order(publishedAt desc) [0...3] {
    _id,
    "slug": slug.current,
    title,
    excerpt,
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
    author-> {
      name,
      role,
      avatar {
        asset-> {
          url
        }
      }
    },
    categories[]-> {
      title,
      "slug": slug.current,
      color,
      icon
    },
    publishedAt,
    readingTime
  }
`)

/**
 * Query para obtener un post por slug
 */
export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAt,
    "slug": slug.current,
    title,
    excerpt,
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
      alt,
      caption
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
    content,
    author-> {
      _id,
      name,
      "slug": slug.current,
      bio,
      role,
      avatar {
        asset-> {
          _id,
          url
        }
      },
      social,
      expertise
    },
    categories[]-> {
      _id,
      title,
      "slug": slug.current,
      description,
      color,
      icon
    },
    tags,
    publishedAt,
    updatedAt,
    readingTime,
    status,
    visibility,
    language,
    seo,
    relatedPosts[]-> {
      _id,
      "slug": slug.current,
      title,
      excerpt,
      mainImage {
        asset-> {
          url
        },
        alt
      },
      author-> {
        name,
        avatar {
          asset-> {
            url
          }
        }
      },
      publishedAt,
      readingTime
    }
  }
`)

/**
 * Query para obtener posts por categoría
 */
export const POSTS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && $categorySlug in categories[]->slug.current && language == $language] | order(publishedAt desc) [0...$limit] {
    _id,
    "slug": slug.current,
    title,
    excerpt,
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
    author-> {
      name,
      role,
      avatar {
        asset-> {
          url
        }
      }
    },
    categories[]-> {
      title,
      "slug": slug.current,
      color,
      icon
    },
    publishedAt,
    readingTime
  }
`)

/**
 * Query para obtener posts por autor
 */
export const POSTS_BY_AUTHOR_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && author->slug.current == $authorSlug && language == $language] | order(publishedAt desc) [0...$limit] {
    _id,
    "slug": slug.current,
    title,
    excerpt,
    mainImage {
      asset-> {
        url
      },
      alt
    },
    categories[]-> {
      title,
      "slug": slug.current,
      color,
      icon
    },
    publishedAt,
    readingTime
  }
`)

/**
 * Query para búsqueda de posts
 */
export const SEARCH_POSTS_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && (
    title match $searchTerm ||
    excerpt match $searchTerm ||
    $searchTerm in tags
  ) && language == $language] | order(publishedAt desc) [0...20] {
    _id,
    "slug": slug.current,
    title,
    excerpt,
    mainImage {
      asset-> {
        url
      },
      alt
    },
    author-> {
      name,
      avatar {
        asset-> {
          url
        }
      }
    },
    categories[]-> {
      title,
      "slug": slug.current,
      color,
      icon
    },
    publishedAt,
    readingTime
  }
`)

/**
 * Query para obtener posts relacionados
 * Basado en categorías compartidas
 */
export const RELATED_POSTS_QUERY = defineQuery(`
  *[_type == "post" && _id != $currentId && status == "published" && count(categories[@._ref in $categoryIds]) > 0 && language == $language] | order(publishedAt desc) [0...3] {
    _id,
    "slug": slug.current,
    title,
    excerpt,
    mainImage {
      asset-> {
        url
      },
      alt
    },
    author-> {
      name
    },
    categories[]-> {
      title,
      color,
      icon
    },
    publishedAt,
    readingTime
  }
`)

/**
 * Query para obtener slugs de posts (generateStaticParams)
 */
export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && status == "published"][].slug.current
`)

// ========== CATEGORIES QUERIES ==========

/**
 * Query para obtener todas las categorías con conteo de posts
 */
export const BLOG_CATEGORIES_QUERY = defineQuery(`
  *[_type == "blogCategory" && language == $language] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    icon,
    color,
    order,
    featured,
    visibility,
    "postCount": count(*[_type == "post" && status == "published" && ^._id in categories[]._ref])
  }
`)

/**
 * Query para obtener una categoría por slug
 */
export const BLOG_CATEGORY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "blogCategory" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    icon,
    color,
    order,
    featured,
    visibility,
    language,
    "postCount": count(*[_type == "post" && status == "published" && ^._id in categories[]._ref])
  }
`)

/**
 * Query para obtener categorías destacadas
 */
export const FEATURED_CATEGORIES_QUERY = defineQuery(`
  *[_type == "blogCategory" && featured == true && language == $language] | order(order asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    description,
    icon,
    color,
    "postCount": count(*[_type == "post" && status == "published" && ^._id in categories[]._ref])
  }
`)

/**
 * Query para obtener slugs de categorías
 */
export const CATEGORY_SLUGS_QUERY = defineQuery(`
  *[_type == "blogCategory" && defined(slug.current)][].slug.current
`)

// ========== AUTHORS QUERIES ==========

/**
 * Query para obtener todos los autores
 */
export const AUTHORS_QUERY = defineQuery(`
  *[_type == "author" && status == "active"] | order(featured desc, name asc) {
    _id,
    name,
    "slug": slug.current,
    bio,
    role,
    avatar {
      asset-> {
        _id,
        url
      }
    },
    expertise,
    featured,
    "postCount": count(*[_type == "post" && status == "published" && author._ref == ^._id])
  }
`)

/**
 * Query para obtener un autor por slug
 */
export const AUTHOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "author" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    bio,
    role,
    email,
    avatar {
      asset-> {
        _id,
        url
      },
      alt
    },
    social,
    expertise,
    featured,
    status,
    "postCount": count(*[_type == "post" && status == "published" && author._ref == ^._id])
  }
`)

/**
 * Query para obtener slugs de autores
 */
export const AUTHOR_SLUGS_QUERY = defineQuery(`
  *[_type == "author" && defined(slug.current) && status == "active"][].slug.current
`)

// ========== STATS QUERIES ==========

/**
 * Query para obtener estadísticas del blog
 */
export const BLOG_STATS_QUERY = defineQuery(`
  {
    "totalPosts": count(*[_type == "post" && status == "published"]),
    "totalCategories": count(*[_type == "blogCategory"]),
    "totalAuthors": count(*[_type == "author" && status == "active"]),
    "recentPosts": *[_type == "post" && status == "published"] | order(publishedAt desc) [0...5] {
      title,
      "slug": slug.current,
      publishedAt
    }
  }
`)

// ========== TYPES ==========

export type BlogPostCard = {
  _id: string
  _createdAt?: string
  slug: string
  title: string
  excerpt: string
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
    caption?: string
  }
  author: {
    _id: string
    name: string
    slug: string
    role?: string
    avatar?: {
      asset: {
        _id: string
        url: string
      }
    }
  }
  categories: Array<{
    _id: string
    title: string
    slug: string
    color: string
    icon?: string
  }>
  tags?: string[]
  publishedAt: string
  readingTime?: number
  featured?: boolean
}

export type BlogPostDetail = Omit<BlogPostCard, 'author'> & {
  content: any[] // Portable Text
  author: Author // Tipo completo de autor con bio, social, etc.
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
  updatedAt?: string
  status: string
  visibility: string
  language: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    ogImage?: any
    noindex?: boolean
  }
  relatedPosts?: Array<{
    _id: string
    slug: string
    title: string
    excerpt: string
    mainImage?: {
      asset: {
        url: string
      }
      alt?: string
    }
    author: {
      name: string
      avatar?: {
        asset: {
          url: string
        }
      }
    }
    publishedAt: string
    readingTime?: number
  }>
}

export type BlogCategory = {
  _id: string
  title: string
  slug: string
  description?: string
  icon?: string
  color: string
  order: number
  featured?: boolean
  visibility: string
  language?: string
  postCount: number
}

export type Author = {
  _id: string
  name: string
  slug: string
  bio?: string
  role?: string
  email?: string
  avatar?: {
    asset: {
      _id: string
      url: string
    }
    alt?: string
  }
  social?: {
    twitter?: string
    linkedin?: string
    tradingview?: string
    website?: string
  }
  expertise?: string[]
  featured?: boolean
  status?: string
  postCount?: number
}

