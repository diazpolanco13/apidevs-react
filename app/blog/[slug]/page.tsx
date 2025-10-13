import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import {
  POST_BY_SLUG_QUERY,
  POST_SLUGS_QUERY,
  type BlogPostDetail,
} from '@/sanity/lib/blog-queries';
import PostContent from '@/components/blog/PostContent';
import PostHeader from '@/components/blog/PostHeader';
import AuthorCard from '@/components/blog/AuthorCard';
import RelatedPosts from '@/components/blog/RelatedPosts';
import ShareButtons from '@/components/blog/ShareButtons';
import TableOfContents from '@/components/blog/TableOfContents';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';

// ISR: Revalidar cada hora
export const revalidate = 3600;

// Generar static params para SSG
export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(POST_SLUGS_QUERY);
    return slugs.map((slug: string) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Metadata dinámica
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await client.fetch(
      POST_BY_SLUG_QUERY,
      { slug: params.slug },
      { next: { revalidate: 3600 } }
    );

    if (!post) {
      return {
        title: 'Post no encontrado - APIDevs',
      };
    }

    const metaTitle = post.seo?.metaTitle || post.title;
    const metaDescription = post.seo?.metaDescription || post.excerpt;
    const ogImage = post.seo?.ogImage?.asset?.url || post.mainImage?.asset?.url;

    return {
      title: `${metaTitle} - APIDevs Blog`,
      description: metaDescription,
      keywords: post.seo?.keywords?.join(', ') || undefined,
      authors: [{ name: post.author?.name || 'APIDevs' }],
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        type: 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name || 'APIDevs'],
        images: ogImage ? [{ url: ogImage }] : [],
        tags: post.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: ogImage ? [ogImage] : [],
      },
      robots: {
        index: !post.seo?.noindex,
        follow: !post.seo?.noindex,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'APIDevs Blog',
    };
  }
}

async function getPost(slug: string) {
  try {
    const post = await client.fetch(
      POST_BY_SLUG_QUERY,
      { slug },
      {
        next: {
          revalidate: 3600,
          tags: [`post:${slug}`],
        },
      }
    );

    return post as BlogPostDetail;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Extraer headings para Table of Contents
  const headings = post.content
    ?.filter((block: any) => block.style && ['h2', 'h3', 'h4'].includes(block.style))
    .map((block: any, index: number) => ({
      id: `heading-${index}`,
      text: block.children
        ?.map((child: any) => child.text)
        .join('') || '',
      level: block.style,
    })) || [];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="minimal" />

      <article className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <a href="/blog" className="hover:text-apidevs-primary transition-colors">
              Blog
            </a>
            <span>→</span>
            {post.categories && post.categories.length > 0 && (
              <>
                <a
                  href={`/blog/category/${post.categories[0].slug}`}
                  className="hover:text-apidevs-primary transition-colors"
                >
                  {post.categories[0].title}
                </a>
                <span>→</span>
              </>
            )}
            <span className="text-gray-500 line-clamp-1">{post.title}</span>
          </nav>

          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Post Header */}
              <Suspense fallback={<div className="h-64 bg-gray-900/20 animate-pulse rounded-xl" />}>
                <PostHeader post={post} />
              </Suspense>

              {/* Post Content */}
              <div className="mt-8 prose prose-invert prose-lg max-w-none">
                <Suspense fallback={<div className="h-96 bg-gray-900/20 animate-pulse rounded-xl" />}>
                  <PostContent content={post.content} />
                </Suspense>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-900/50 border border-gray-800 rounded-full text-sm text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-800">
                <Suspense fallback={null}>
                  <ShareButtons post={post} />
                </Suspense>
              </div>

              {/* Author Card */}
              {post.author && (
                <div className="mt-12">
                  <Suspense fallback={<div className="h-48 bg-gray-900/20 animate-pulse rounded-xl" />}>
                    <AuthorCard author={post.author} />
                  </Suspense>
                </div>
              )}

              {/* Related Posts */}
              {post.relatedPosts && post.relatedPosts.length > 0 && (
                <div className="mt-16">
                  <Suspense fallback={<div className="h-64 bg-gray-900/20 animate-pulse rounded-xl" />}>
                    <RelatedPosts posts={post.relatedPosts} />
                  </Suspense>
                </div>
              )}
            </div>

            {/* Sidebar - Desktop Only */}
            <aside className="hidden xl:block w-80 space-y-6 sticky top-24 self-start">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <Suspense fallback={<div className="h-96 bg-gray-900/20 animate-pulse rounded-xl" />}>
                  <TableOfContents headings={headings} />
                </Suspense>
              )}

              {/* Author Mini Card */}
              {post.author && (
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                  <div className="flex items-center gap-4 mb-4">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar.asset.url}
                        alt={post.author.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="text-white font-semibold">{post.author.name}</h4>
                      {post.author.role && (
                        <p className="text-sm text-gray-400">{post.author.role}</p>
                      )}
                    </div>
                  </div>
                  {post.author.bio && (
                    <p className="text-sm text-gray-400 line-clamp-3">{post.author.bio}</p>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
}

