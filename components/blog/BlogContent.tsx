'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { BlogPostCard, BlogCategory } from '@/sanity/lib/blog-queries';
import BlogHero from './BlogHero';
import BlogCard from './BlogCard';
import Pagination from './Pagination';

interface BlogContentProps {
  featuredPosts: BlogPostCard[];
  recentPosts: BlogPostCard[];
  categories: BlogCategory[];
}

export default function BlogContent({ featuredPosts, recentPosts, categories }: BlogContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Configuración de paginación
  const POSTS_PER_PAGE = 8; // 2 filas de 4 columnas
  
  // Reset página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);
  
  // Scroll suave al cambiar de página
  const scrollToContent = () => {
    if (contentRef.current) {
      const yOffset = -100; // Offset para el navbar
      const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Filtrar posts según categoría y búsqueda
  const filteredPosts = useMemo(() => {
    let posts = recentPosts;
    
    // Filtrar por categoría
    if (selectedCategory) {
      posts = posts.filter(post => 
        post.categories?.some(cat => cat._id === selectedCategory)
      );
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(query);
        const excerptMatch = post.excerpt?.toLowerCase().includes(query);
        return titleMatch || excerptMatch;
      });
    }
    
    return posts;
  }, [recentPosts, selectedCategory, searchQuery]);

  // Agrupar posts de búsqueda por categoría
  const searchResultsByCategory = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // Usamos el tipo de categoría que viene en los posts (más simple)
    type PostCategory = NonNullable<BlogPostCard['categories']>[number];
    const categoriesMap = new Map<string, { category: PostCategory; posts: BlogPostCard[] }>();
    
    filteredPosts.forEach(post => {
      post.categories?.forEach(cat => {
        if (!categoriesMap.has(cat._id)) {
          categoriesMap.set(cat._id, { category: cat, posts: [] });
        }
        categoriesMap.get(cat._id)!.posts.push(post);
      });
    });
    
    return Array.from(categoriesMap.values());
  }, [filteredPosts, searchQuery]);
  
  // Lógica de paginación
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage, POSTS_PER_PAGE]);
  
  // Handler para cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToContent();
  };

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
      {/* FILTROS PEGADOS AL NAVBAR - RESPONSIVE MEJORADO */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 mb-10">
        {/* Contenedor con scroll horizontal en mobile */}
        <div className="border-b border-gray-800/50 pb-4 relative">
          {/* Layout en 2 filas en mobile, 1 fila en desktop */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Categorías con scroll horizontal en mobile */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`relative px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  selectedCategory === null
                    ? 'text-white bg-gray-800/50 rounded-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg'
                }`}
              >
                <span className="relative">
                  Recent
                  {selectedCategory === null && (
                    <span className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-apidevs-primary"></span>
                  )}
                </span>
              </button>
              
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`relative px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    selectedCategory === category._id
                      ? 'text-white bg-gray-800/50 rounded-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg'
                  }`}
                >
                  <span className="relative">
                    {category.title}
                    {selectedCategory === category._id && (
                      <span className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-apidevs-primary"></span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            {/* SEARCH BAR - Ahora en flexbox normal */}
            <div className="relative group flex-shrink-0 lg:ml-auto">
              {/* Glow effect cuando está en focus */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-apidevs-primary/20 via-purple-500/20 to-apidevs-primary/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur-lg transition-all duration-500"></div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-apidevs-primary/70 group-focus-within:text-apidevs-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar artículos..."
                  className="w-full lg:w-72 pl-10 sm:pl-11 pr-10 py-2 sm:py-2.5 bg-gray-900/80 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 focus:border-apidevs-primary/50 focus:bg-gray-900 transition-all shadow-lg hover:border-gray-600/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-apidevs-primary transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        {/* Vista de BÚSQUEDA - Agrupada por categorías */}
        {searchQuery && !selectedCategory ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Resultados para "<span className="text-apidevs-primary">{searchQuery}</span>"
                </h2>
                <p className="text-gray-400">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
                  {searchResultsByCategory.length > 1 && (
                    <> en <span className="text-white font-semibold">{searchResultsByCategory.length} categorías</span></>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-2 text-sm font-semibold text-apidevs-primary hover:text-apidevs-primary-light transition-colors group"
              >
                <span>Limpiar búsqueda</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800/50">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-300 mb-2">No se encontraron resultados</h3>
                <p className="text-gray-500 mb-6">Intenta con otros términos de búsqueda</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-semibold rounded-lg transition-colors"
                >
                  Ver todos los artículos
                </button>
              </div>
            ) : (
              <div className="space-y-16">
                {searchResultsByCategory.map((item, categoryIndex) => (
                  <div key={item.category._id}>
                    <div className="flex items-center gap-3 mb-6">
                      {item.category.icon && <span className="text-2xl">{item.category.icon}</span>}
                      <h3 className="text-2xl font-bold text-white">{item.category.title}</h3>
                      <span className="text-sm text-gray-400">
                        ({item.posts.length} {item.posts.length === 1 ? 'resultado' : 'resultados'})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {item.posts.map((post, index) => (
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
              </div>
            )}
          </div>
        ) : (selectedCategory || searchQuery) ? (
          /* Vista filtrada por CATEGORÍA (con o sin búsqueda) */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {searchQuery ? (
                    <>Resultados para "<span className="text-apidevs-primary">{searchQuery}</span>"</>
                  ) : (
                    categories.find(c => c._id === selectedCategory)?.title
                  )}
                </h2>
                <p className="text-gray-400">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
                  {selectedCategory && searchQuery && (
                    <> en <span className="text-white font-semibold">{categories.find(c => c._id === selectedCategory)?.title}</span></>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 text-sm font-semibold text-apidevs-primary hover:text-apidevs-primary-light transition-colors group"
              >
                <span>Limpiar filtros</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800/50">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-300 mb-2">
                  {searchQuery ? 'No se encontraron resultados' : 'No hay artículos en esta categoría'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Intenta con otra categoría'}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-semibold rounded-lg transition-colors"
                >
                  Ver todos los artículos
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedPosts.map((post, index) => (
                    <div
                      key={post._id}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      className="animate-fade-in-up"
                    >
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
                
                {/* Paginación para vista filtrada */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-12"
                  />
                )}
              </>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

