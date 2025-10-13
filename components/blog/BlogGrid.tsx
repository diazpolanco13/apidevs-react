'use client';

import { useState } from 'react';
import { BlogPostCard, BlogCategory } from '@/sanity/lib/blog-queries';
import BlogCard from './BlogCard';

interface BlogGridProps {
  posts: BlogPostCard[];
  categories: BlogCategory[];
}

export default function BlogGrid({ posts, categories }: BlogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = !selectedCategory || 
      post.categories.some((cat) => cat._id === selectedCategory);
    
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header con controles mejorados */}
      <div className="space-y-6">
        {/* Título y contador */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Últimos Artículos
              </span>
            </h2>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apidevs-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-apidevs-primary"></span>
              </span>
              <span className="font-medium">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
              </span>
            </p>
          </div>
        </div>

        {/* Búsqueda mejorada */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-apidevs-primary/20 to-purple-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition duration-300"></div>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por título, contenido o tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-apidevs-primary focus:ring-2 focus:ring-apidevs-primary/20 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-apidevs-primary transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtros por categoría rediseñados */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">Filtrar por categoría:</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  !selectedCategory
                    ? 'bg-apidevs-primary text-gray-900 shadow-primary'
                    : 'bg-gray-900/30 text-gray-400 hover:bg-gray-800/50 hover:text-white border border-gray-800 hover:border-gray-700'
                }`}
              >
                <span className="relative z-10">Todos</span>
                {!selectedCategory && (
                  <div className="absolute inset-0 bg-apidevs-primary rounded-xl blur-md opacity-50"></div>
                )}
              </button>
              {categories.map((category) => {
                const isSelected = selectedCategory === category._id;
                return (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-apidevs-primary text-gray-900 shadow-primary'
                        : 'bg-gray-900/30 text-gray-400 hover:bg-gray-800/50 hover:text-white border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-apidevs-primary rounded-xl blur-md opacity-50"></div>
                    )}
                    {category.icon && (
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {category.icon}
                      </span>
                    )}
                    <span className="relative z-10">{category.title}</span>
                    <span className={`relative z-10 text-xs px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-gray-900/20' : 'bg-gray-800/50'
                    }`}>
                      {category.postCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid de posts con animación */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredPosts.map((post, index) => (
            <div
              key={post._id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          {/* Empty state mejorado */}
          <div className="max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-apidevs-primary/10 rounded-full blur-2xl"></div>
              </div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-900/50 border border-gray-800">
                <svg
                  className="w-10 h-10 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No encontramos artículos
            </h3>
            <p className="text-gray-400 mb-6">
              Intenta ajustar los filtros o usar otros términos de búsqueda
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-apidevs-primary/10 hover:bg-apidevs-primary text-apidevs-primary hover:text-gray-900 font-semibold rounded-xl border border-apidevs-primary/20 hover:border-apidevs-primary transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

