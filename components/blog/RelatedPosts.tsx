'use client';

import Link from 'next/link';
import Image from 'next/image';

interface RelatedPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  mainImage?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  author: {
    name: string;
    avatar?: {
      asset: {
        url: string;
      };
    };
  };
  publishedAt: string;
  readingTime?: number;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">
        Artículos Relacionados
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group block bg-gray-900/20 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-700 transition-all"
          >
            {/* Imagen */}
            {post.mainImage && (
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.mainImage.asset.url}
                  alt={post.mainImage.alt || post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            )}
            
            {/* Contenido */}
            <div className="p-4 space-y-2">
              <h4 className="text-lg font-bold text-white line-clamp-2 group-hover:text-apidevs-primary transition-colors">
                {post.title}
              </h4>
              
              <p className="text-sm text-gray-400 line-clamp-2">
                {post.excerpt}
              </p>
              
              {/* Meta */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                <time>
                  {new Date(post.publishedAt).toLocaleDateString('es-ES', {
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

