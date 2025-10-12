import { groq } from 'next-sanity'

// ==========================================
// CATEGORÍAS DE DOCUMENTACIÓN
// ==========================================

export const DOC_CATEGORIES_QUERY = groq`
  *[_type == "docCategory" && language == $language] | order(order asc) {
    _id,
    title,
    slug,
    icon,
    order,
    description,
    isCollapsible,
    defaultExpanded,
    language
  }
`

// ==========================================
// TODAS LAS PÁGINAS DE DOCUMENTACIÓN
// ==========================================

export const ALL_DOCS_QUERY = groq`
  *[_type == "documentation" && language == $language] | order(category->order asc, order asc) {
    _id,
    title,
    "slug": slug.current,
    "categorySlug": category->slug.current,
    "categoryTitle": category->title,
    "categoryIcon": category->icon,
    order,
    icon,
    description,
    publishedAt,
    updatedAt,
    language
  }
`

// ==========================================
// SIDEBAR: CATEGORÍAS CON SUS PÁGINAS
// ==========================================

export const SIDEBAR_DOCS_QUERY = groq`
  {
    "categories": *[_type == "docCategory" && language == $language] | order(order asc) {
      _id,
      title,
      slug,
      icon,
      order,
      isCollapsible,
      defaultExpanded,
      "pages": *[_type == "documentation" && category._ref == ^._id && language == $language] | order(order asc) {
        _id,
        title,
        "slug": slug.current,
        icon,
        order,
        description
      }
    }
  }
`

// ==========================================
// PÁGINA INDIVIDUAL POR SLUG
// ==========================================

export const DOC_BY_SLUG_QUERY = groq`
  *[_type == "documentation" && slug.current == $slug && language == $language][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    icon,
    content,
    language,
    category->{
      _id,
      title,
      "slug": slug.current,
      icon,
      order,
      language
    },
    order,
    nextPage->{
      title,
      "slug": slug.current
    },
    previousPage->{
      title,
      "slug": slug.current
    },
    relatedPages[]->{
      title,
      "slug": slug.current,
      description
    },
    seo,
    publishedAt,
    updatedAt
  }
`

// ==========================================
// SLUGS PARA STATIC GENERATION
// ==========================================

export const DOC_SLUGS_QUERY = groq`
  *[_type == "documentation" && defined(slug.current) && language == $language]{
    "slug": slug.current
  }.slug
`

// ==========================================
// BÚSQUEDA EN DOCUMENTACIÓN
// ==========================================

export const SEARCH_DOCS_QUERY = groq`
  *[
    _type == "documentation" && 
    language == $language &&
    (
      title match $searchTerm + "*" ||
      description match $searchTerm + "*" ||
      pt::text(content) match $searchTerm + "*"
    )
  ] | order(_score desc) [0...10] {
    _id,
    title,
    "slug": slug.current,
    description,
    "categoryTitle": category->title,
    "categorySlug": category->slug.current,
    "excerpt": pt::text(content)[0...150],
    language
  }
`

// ==========================================
// TABLA DE CONTENIDOS (TOC)
// ==========================================

export const DOC_TOC_QUERY = groq`
  *[_type == "documentation" && slug.current == $slug && language == $language][0] {
    "headings": content[style in ["h1", "h2", "h3", "h4"]] {
      "text": pt::text(@),
      "style": style
    }
  }
`

// ==========================================
// PÁGINAS POR CATEGORÍA
// ==========================================

export const DOCS_BY_CATEGORY_QUERY = groq`
  *[_type == "documentation" && category->slug.current == $categorySlug && language == $language] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    icon,
    order,
    publishedAt,
    language
  }
`

// ==========================================
// TIPOS TYPESCRIPT
// ==========================================

export interface DocCategory {
  _id: string
  title: string
  slug: { current: string }
  icon?: string
  order: number
  description?: string
  isCollapsible: boolean
  defaultExpanded: boolean
  language: string
}

export interface DocListItem {
  _id: string
  title: string
  slug: string
  categorySlug?: string
  categoryTitle?: string
  categoryIcon?: string
  order: number
  icon?: string
  description?: string
  publishedAt?: string
  updatedAt?: string
  language: string
}

export interface DocPage {
  _id: string
  title: string
  slug: string
  description?: string
  icon?: string
  content: any[] // Portable Text
  language: string
  category: {
    _id: string
    title: string
    slug: string
    icon?: string
    order: number
    language: string
  }
  order: number
  nextPage?: {
    title: string
    slug: string
  }
  previousPage?: {
    title: string
    slug: string
  }
  relatedPages?: Array<{
    title: string
    slug: string
    description?: string
  }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
  publishedAt?: string
  updatedAt?: string
}

export interface SidebarData {
  categories: Array<{
    _id: string
    title: string
    slug: { current: string }
    icon?: string
    order: number
    isCollapsible: boolean
    defaultExpanded: boolean
    pages: Array<{
      _id: string
      title: string
      slug: string
      icon?: string
      order: number
      description?: string
    }>
  }>
}

export interface SearchResult {
  _id: string
  title: string
  slug: string
  description?: string
  categoryTitle?: string
  categorySlug?: string
  excerpt?: string
  language: string
}

export interface TocHeading {
  text: string
  style: 'h1' | 'h2' | 'h3' | 'h4'
}

