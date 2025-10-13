'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogPostCard } from '@/sanity/lib/blog-queries';
import { urlForImage } from '@/sanity/lib/image';
import CategoryBadge from './CategoryBadge';

interface BlogCardProps {
  post: BlogPostCard;
  variant?: 'default' | 'compact';
}

export default function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  const imageUrl = post.mainImage 
    ? urlForImage(post.mainImage)?.width(600).height(400).url() 
    : null;

  // VARIANTE COMPACT - Horizontal para sidebar
  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 group-hover:border-gray-700 transition-all duration-500">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-apidevs-primary/20 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
          
          <div className="relative flex gap-4 p-4">
            {/* IMAGEN PEQUEÑA */}
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={post.mainImage?.alt || post.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-apidevs-primary/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-4xl">📊</span>
                </div>
              )}
              
              {/* Badge categoría pequeño */}
              {post.categories && post.categories.length > 0 && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 bg-apidevs-primary text-black text-[10px] font-bold rounded uppercase">
                    {post.categories[0].icon && <span className="mr-1">{post.categories[0].icon}</span>}
                    {post.categories[0].title}
                  </span>
                </div>
              )}
            </div>

            {/* CONTENIDO */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              {/* Badge categoría texto */}
              {post.categories && post.categories.length > 0 && (
                <span className="text-xs font-bold text-apidevs-primary uppercase tracking-wider mb-2">
                  {post.categories[0].title}
                </span>
              )}

              {/* Título */}
              <h3 className="text-base font-bold text-white leading-tight line-clamp-2 group-hover:text-apidevs-primary transition-colors duration-300 mb-2">
                {post.title}
              </h3>

              {/* Meta info */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {post.author && (
                  <>
                    <span className="font-medium">By {post.author.name}</span>
                    <span className="text-gray-700">•</span>
                  </>
                )}
                <time>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // VARIANTE DEFAULT - Vertical normal
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="relative h-full overflow-hidden rounded-2xl bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 group-hover:border-gray-700 transition-all duration-500 group-hover:transform group-hover:scale-[1.02]">
        {/* Glow effect sutil */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-apidevs-primary/20 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
        
        <div className="relative h-full flex flex-col">
          {/* IMAGEN */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={post.mainImage?.alt || post.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                />
                {/* Gradiente overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                
                {/* Badge categoría tipo LuxAlgo con color APIDevs */}
                {post.categories && post.categories.length > 0 && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-apidevs-primary backdrop-blur-sm text-black text-xs font-bold rounded uppercase tracking-wide shadow-lg">
                      {post.categories[0].icon && <span className="text-sm">{post.categories[0].icon}</span>}
                      {post.categories[0].title}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-apidevs-primary/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-7xl">📊</span>
              </div>
            )}
          </div>

          {/* CONTENIDO */}
          <div className="flex-1 flex flex-col p-6 space-y-4">
            {/* Título clean */}
            <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-apidevs-primary transition-colors duration-300">
              {post.title}
            </h3>

            {/* Meta info minimalista */}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              {post.author && (
                <>
                  <span className="font-medium">By {post.author.name}</span>
                  <span className="text-gray-700">•</span>
                </>
              )}
              <time>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* Excerpt */}
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1">
              {post.excerpt || 'Descubre estrategias y análisis profesional para mejorar tu trading.'}
            </p>

            {/* CTA minimalista */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-apidevs-primary group-hover:text-apidevs-primary-light transition-colors">
                <span>Read more</span>
                <svg 
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

