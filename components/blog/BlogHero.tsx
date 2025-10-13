'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogPostCard } from '@/sanity/lib/blog-queries';
import { urlForImage } from '@/sanity/lib/image';
import CategoryBadge from './CategoryBadge';

interface BlogHeroProps {
  post: BlogPostCard;
}

export default function BlogHero({ post }: BlogHeroProps) {
  const imageUrl = post.mainImage?.asset 
    ? urlForImage(post.mainImage)?.width(1200).height(630).url() 
    : null;

  return (
    <div className="relative w-full bg-gradient-to-b from-gray-900/50 to-transparent pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              {/* Imagen */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden lg:col-span-2 order-2 lg:order-1">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={post.mainImage?.alt || post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-apidevs-primary/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-6xl">📝</span>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                
                {/* Featured Badge */}
                {post.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-apidevs-primary text-gray-900 text-sm font-semibold rounded-full">
                      ⭐ Destacado
                    </span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="space-y-4 lg:col-span-3 order-1 lg:order-2">
                {/* Categorías */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.slice(0, 2).map((category, index) => (
                      <CategoryBadge key={category._id || `category-${index}`} category={category} />
                    ))}
                  </div>
                )}

                {/* Título */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight group-hover:text-apidevs-primary transition-colors">
                  {post.title}
                </h1>

                {/* Excerpt */}
                <p className="text-base md:text-lg text-gray-300 line-clamp-2 md:line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 pt-4">
                  {/* Autor */}
                  {post.author && (
                    <div className="flex items-center gap-3">
                      {post.author.avatar && (
                        <img
                          src={post.author.avatar.asset.url}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm text-white font-medium">
                          {post.author.name}
                        </p>
                        {post.author.role && (
                          <p className="text-xs text-gray-400">
                            {post.author.role}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <span className="text-gray-600">•</span>

                  {/* Fecha */}
                  <time className="text-sm text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>

                  {/* Reading time */}
                  {post.readingTime && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-400">
                        {post.readingTime} min de lectura
                      </span>
                    </>
                  )}
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <span className="inline-flex items-center gap-2 text-apidevs-primary font-semibold group-hover:gap-4 transition-all">
                    Leer artículo completo
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

