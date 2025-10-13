'use client';

import Image from 'next/image';
import { BlogPostDetail } from '@/sanity/lib/blog-queries';
import { urlForImage } from '@/sanity/lib/image';
import CategoryBadge from './CategoryBadge';

interface PostHeaderProps {
  post: BlogPostDetail;
}

export default function PostHeader({ post }: PostHeaderProps) {
  const imageUrl = post.mainImage?.asset?.url 
    ? urlForImage(post.mainImage.asset)?.width(1200).height(630).url() 
    : null;

  return (
    <header className="space-y-6">
      {/* Categorías */}
      {post.categories && post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.categories.map((category) => (
            <a
              key={category._id}
              href={`/blog/category/${category.slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              <CategoryBadge category={category} />
            </a>
          ))}
        </div>
      )}

      {/* Título */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="text-xl text-gray-300 leading-relaxed">
        {post.excerpt}
      </p>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 pt-4 pb-6 border-b border-gray-800">
        {/* Autor */}
        {post.author && (
          <div className="flex items-center gap-3">
            {post.author.avatar && (
              <img
                src={post.author.avatar.asset.url}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-800"
              />
            )}
            <div>
              <a
                href={`/blog/author/${post.author.slug}`}
                className="text-white font-semibold hover:text-apidevs-primary transition-colors"
              >
                {post.author.name}
              </a>
              {post.author.role && (
                <p className="text-sm text-gray-400">
                  {post.author.role}
                </p>
              )}
            </div>
          </div>
        )}

        <span className="text-gray-700">•</span>

        {/* Fecha */}
        <div className="text-sm">
          <time className="text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <p className="text-gray-600 text-xs mt-0.5">
              Actualizado:{' '}
              {new Date(post.updatedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Reading time */}
        {post.readingTime && (
          <>
            <span className="text-gray-700">•</span>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{post.readingTime} min de lectura</span>
            </div>
          </>
        )}
      </div>

      {/* Imagen destacada */}
      {imageUrl && (
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.mainImage?.alt || post.title}
            fill
            className="object-cover"
            priority
          />
          {post.mainImage?.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
              <p className="text-sm text-gray-300 text-center">
                {post.mainImage.caption}
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

