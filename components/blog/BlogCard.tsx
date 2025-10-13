'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogPostCard } from '@/sanity/lib/blog-queries';
import { urlForImage } from '@/sanity/lib/image';
import CategoryBadge from './CategoryBadge';

interface BlogCardProps {
  post: BlogPostCard;
}

export default function BlogCard({ post }: BlogCardProps) {
  const imageUrl = post.mainImage 
    ? urlForImage(post.mainImage)?.width(600).height(400).url() 
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-gray-900/20 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-700 transition-all duration-300 hover:transform hover:scale-[1.02]"
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.mainImage?.alt || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-apidevs-primary/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-6xl">📝</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

        {/* Categorías overlay */}
        {post.categories && post.categories.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {post.categories.slice(0, 1).map((category) => (
              <CategoryBadge key={category._id} category={category} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-3">
        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {/* Fecha */}
          <time>
            {new Date(post.publishedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>

          {post.readingTime && (
            <>
              <span>•</span>
              <span>{post.readingTime} min</span>
            </>
          )}
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-apidevs-primary transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-sm line-clamp-3">
          {post.excerpt}
        </p>

        {/* Autor */}
        {post.author && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-800/50">
            {post.author.avatar && (
              <img
                src={post.author.avatar.asset.url}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {post.author.name}
              </p>
              {post.author.role && (
                <p className="text-xs text-gray-500 truncate">
                  {post.author.role}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

