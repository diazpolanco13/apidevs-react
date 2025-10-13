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
      {/* Header con título y controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Últimos Artículos
          </h2>
          <p className="text-gray-400 mt-1">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

        {/* Búsqueda */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-apidevs-primary transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
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
        </div>
      </div>

      {/* Filtros por categoría */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !selectedCategory
                ? 'bg-apidevs-primary text-gray-900'
                : 'bg-gray-900/30 text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedCategory === category._id
                  ? 'bg-apidevs-primary text-gray-900'
                  : 'bg-gray-900/30 text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              {category.icon && <span>{category.icon}</span>}
              <span>{category.title}</span>
              <span className="text-xs opacity-70">
                ({category.postCount})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grid de posts */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900/50 mb-4">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No se encontraron artículos
          </h3>
          <p className="text-gray-400">
            Intenta con otros términos de búsqueda o categoría
          </p>
        </div>
      )}
    </div>
  );
}

