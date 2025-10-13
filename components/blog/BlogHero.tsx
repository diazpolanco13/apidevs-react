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
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl">
        {/* Glow effect premium */}
        <div className="absolute -inset-1 bg-gradient-to-r from-apidevs-primary/30 via-purple-500/20 to-apidevs-primary/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700"></div>
        
        <div className="relative border border-gray-800/50 group-hover:border-gray-700 rounded-2xl overflow-hidden transition-all duration-500">
          {/* IMAGEN CON TEXTO SUPERPUESTO */}
          <div className="relative aspect-[16/9] overflow-hidden">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={post.mainImage?.alt || post.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  priority
                />
                {/* Gradiente fuerte para legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                
                {/* Badge categoría */}
                {post.categories && post.categories.length > 0 && (
                  <div className="absolute top-6 left-6 z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-apidevs-primary backdrop-blur-sm text-black text-xs font-bold rounded-md uppercase tracking-wider shadow-lg">
                      {post.categories[0].icon && <span>{post.categories[0].icon}</span>}
                      {post.categories[0].title}
                    </span>
                  </div>
                )}
                
                {/* Featured Badge */}
                {post.featured && (
                  <div className="absolute top-6 right-6 z-10">
                    <span className="inline-block px-3 py-1.5 bg-apidevs-primary/10 backdrop-blur-md text-apidevs-primary text-xs font-bold rounded-full uppercase tracking-wider border border-apidevs-primary/20">
                      Featured
                    </span>
                  </div>
                )}

                {/* CONTENIDO SUPERPUESTO EN LA PARTE INFERIOR */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 z-10">
                  {/* Título grande y bold */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.15] tracking-tight mb-4">
                    {post.title}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-base text-gray-200 leading-relaxed line-clamp-2 mb-6">
                    {post.excerpt || 'Descubre las últimas estrategias y análisis técnico para mejorar tu trading profesional.'}
                  </p>

                  {/* Meta info + CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {/* Meta info minimalista */}
                    <div className="flex items-center gap-4">
                      {post.author && (
                        <>
                          <span className="text-sm text-white font-semibold">
                            By {post.author.name}
                          </span>
                          <span className="text-gray-500">•</span>
                        </>
                      )}
                      <time className="text-sm text-gray-300">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </div>

                    {/* Arrow hover effect */}
                    <div className="inline-flex items-center gap-2 text-apidevs-primary group-hover:text-apidevs-primary-light transition-colors">
                      <span className="text-sm font-semibold">Read more</span>
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
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-apidevs-primary/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-9xl">📊</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

