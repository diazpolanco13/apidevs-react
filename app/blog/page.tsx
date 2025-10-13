import { Suspense } from 'react';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import {
  BLOG_POSTS_QUERY,
  FEATURED_POSTS_QUERY,
  BLOG_CATEGORIES_QUERY,
  type BlogPostCard,
  type BlogCategory,
} from '@/sanity/lib/blog-queries';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import BlogHero from '@/components/blog/BlogHero';
import BlogCard from '@/components/blog/BlogCard';
import BlogGrid from '@/components/blog/BlogGrid';

// ISR: Revalidar cada hora
export const revalidate = 3600;

export const metadata = {
  title: 'Blog - APIDevs | Análisis de Trading y Estrategias de Mercado',
  description: 'Artículos, tutoriales y análisis técnico sobre trading, indicadores y estrategias de mercado. Aprende con expertos traders de APIDevs.',
  openGraph: {
    title: 'Blog APIDevs | Trading & Análisis Técnico',
    description: 'Artículos y tutoriales sobre trading, indicadores y estrategias de mercado.',
    type: 'website',
  },
};

async function getBlogData() {
  try {
    const [featuredPosts, recentPosts, categories] = await Promise.all([
      client.fetch(FEATURED_POSTS_QUERY, { language: 'es' }, {
        next: { revalidate: 3600, tags: ['blog-featured'] },
      }),
      client.fetch(BLOG_POSTS_QUERY, { language: 'es', limit: 12 }, {
        next: { revalidate: 3600, tags: ['blog-posts'] },
      }),
      client.fetch(BLOG_CATEGORIES_QUERY, { language: 'es' }, {
        next: { revalidate: 3600, tags: ['blog-categories'] },
      }),
    ]);

    return {
      featuredPosts: featuredPosts as BlogPostCard[],
      recentPosts: recentPosts as BlogPostCard[],
      categories: categories as BlogCategory[],
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      featuredPosts: [],
      recentPosts: [],
      categories: [],
    };
  }
}

export default async function BlogPage() {
  const { featuredPosts, recentPosts, categories } = await getBlogData();

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundEffects />
      
      <div className="relative z-10 min-h-screen pt-20 pb-20">
        {/* FILTROS PEGADOS AL NAVBAR */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 mb-10">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-800/50 pb-4">
            <button className="relative px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-apidevs-primary">
              Recent
            </button>
            
            {categories.map((category) => (
              <button
                key={category._id}
                className="px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-800/30 rounded-lg"
              >
                {category.title}
              </button>
            ))}

            {/* SEARCH BAR INTEGRADA */}
            <div className="ml-auto relative group hidden lg:block">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar artículos..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-apidevs-primary/50 focus:border-apidevs-primary/50 transition-all"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
          {/* HERO + 3 POSTS RECIENTES - LAYOUT LUXALGO */}
          {featuredPosts.length > 0 && recentPosts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* HERO GRANDE - 2 COLUMNAS */}
              <div className="lg:col-span-2">
                <Suspense fallback={<div className="h-[600px] bg-gray-900/20 animate-pulse rounded-3xl" />}>
                  <BlogHero post={featuredPosts[0]} />
                </Suspense>
              </div>

              {/* 3 POSTS RECIENTES - 1 COLUMNA */}
              <div className="space-y-6">
                {recentPosts.slice(0, 3).map((post, index) => (
                  <Suspense key={post._id} fallback={<div className="h-48 bg-gray-900/20 rounded-xl animate-pulse" />}>
                    <div
                      style={{ animationDelay: `${index * 0.1}s` }}
                      className="animate-fade-in-up"
                    >
                      <BlogCard post={post} variant="compact" />
                    </div>
                  </Suspense>
                ))}
              </div>
            </div>
          )}

          {/* SECCIONES POR CATEGORÍA */}
          {categories.map((category, categoryIndex) => {
            // Filtrar posts por categoría
            const categoryPosts = recentPosts.filter(post => 
              post.categories?.some(cat => cat._id === category._id)
            );

            // Solo mostrar categorías con posts
            if (categoryPosts.length === 0) return null;

            return (
              <div key={category._id}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    {category.icon && <span className="text-3xl">{category.icon}</span>}
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {category.title}
                    </h2>
                  </div>
                  <Link 
                    href={`/blog/category/${category.slug}`}
                    className="flex items-center gap-2 text-sm font-semibold text-apidevs-primary hover:text-apidevs-primary-light transition-colors group"
                  >
                    <span>View All</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryPosts.slice(0, 3).map((post, index) => (
                    <div
                      key={post._id}
                      style={{ animationDelay: `${(categoryIndex * 3 + index) * 0.05}s` }}
                      className="animate-fade-in-up"
                    >
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* TODOS LOS POSTS (si no hay categorías o quedan posts sin categorizar) */}
          {recentPosts.length > 3 && categories.length === 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  All Posts
                </h2>
                <Link 
                  href="/blog/all" 
                  className="flex items-center gap-2 text-sm font-semibold text-apidevs-primary hover:text-apidevs-primary-light transition-colors group"
                >
                  <span>View All</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.slice(3, 12).map((post, index) => (
                  <div
                    key={post._id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="animate-fade-in-up"
                  >
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

