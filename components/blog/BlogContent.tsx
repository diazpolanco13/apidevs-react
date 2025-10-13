'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { BlogPostCard, BlogCategory } from '@/sanity/lib/blog-queries';
import BlogHero from './BlogHero';
import BlogCard from './BlogCard';

interface BlogContentProps {
  featuredPosts: BlogPostCard[];
  recentPosts: BlogPostCard[];
  categories: BlogCategory[];
}

export default function BlogContent({ featuredPosts, recentPosts, categories }: BlogContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtrar posts según categoría seleccionada
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return recentPosts;
    }
    
    return recentPosts.filter(post => 
      post.categories?.some(cat => cat._id === selectedCategory)
    );
  }, [recentPosts, selectedCategory]);

  // Agrupar posts por categoría para las secciones
  const postsByCategory = useMemo(() => {
    return categories.map(category => {
      const categoryPosts = recentPosts.filter(post =>
        post.categories?.some(cat => cat._id === category._id)
      );
      return {
        category,
        posts: categoryPosts,
      };
    }).filter(item => item.posts.length > 0);
  }, [categories, recentPosts]);

  return (
    <>
      {/* FILTROS PEGADOS AL NAVBAR */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 mb-10">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-800/50 pb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`relative px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              selectedCategory === null
                ? 'text-white after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-apidevs-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg'
            }`}
          >
            Recent
          </button>
          
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`relative px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                selectedCategory === category._id
                  ? 'text-white after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-apidevs-primary'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg'
              }`}
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
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        {/* Vista filtrada - Mostrar cuando hay un filtro activo */}
        {selectedCategory ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {categories.find(c => c._id === selectedCategory)?.title}
                </h2>
                <p className="text-gray-400">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm font-semibold text-apidevs-primary hover:text-apidevs-primary-light transition-colors group"
              >
                <span>Ver todos</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800/50">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-300 mb-2">No hay artículos en esta categoría</h3>
                <p className="text-gray-500 mb-6">Intenta con otra categoría</p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-5 py-2.5 bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-semibold rounded-lg transition-colors"
                >
                  Ver todos los artículos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <div
                    key={post._id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="animate-fade-in-up"
                  >
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Vista normal - Hero + Sidebar + Categorías */}
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
            {postsByCategory.map((item, categoryIndex) => (
              <div key={item.category._id}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    {item.category.icon && <span className="text-3xl">{item.category.icon}</span>}
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {item.category.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(item.category._id)}
                    className="flex items-center gap-2 text-sm font-semibold text-apidevs-primary hover:text-apidevs-primary-light transition-colors group"
                  >
                    <span>View All</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {item.posts.slice(0, 3).map((post, index) => (
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
            ))}

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
          </>
        )}
      </div>
    </>
  );
}

