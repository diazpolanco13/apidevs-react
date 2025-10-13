import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
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
import PostAccessCard from '@/components/blog/PostAccessCard';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';

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

// Función para determinar el plan del usuario
function getUserPlan(user: any, subscription: any, hasLifetimeAccess: boolean) {
  if (!user) return 'guest';
  if (hasLifetimeAccess) return 'lifetime';
  
  const metadata = subscription?.metadata as { plan_type?: string } | null;
  if (metadata?.plan_type) return metadata.plan_type;
  
  const productName = ((subscription as any)?.prices?.products as any)?.name?.toLowerCase() || '';
  if (productName.includes('lifetime')) return 'lifetime';
  
  if (subscription?.status === 'active') return 'pro';
  
  return 'free';
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  
  const [post, user, subscription] = await Promise.all([
    getPost(params.slug),
    getUser(supabase),
    getSubscription(supabase),
  ]);

  if (!post) {
    notFound();
  }

  // Verificar si tiene compras Lifetime (igual que en indicadores)
  let hasLifetimeAccess = false;
  if (user) {
    const { data: lifetimePurchases } = await (supabase as any)
      .from('purchases')
      .select('id, is_lifetime_purchase, order_total_cents, payment_method')
      .eq('customer_email', user.email)
      .eq('is_lifetime_purchase', true)
      .eq('payment_status', 'paid')
      .gt('order_total_cents', 0);
    
    const paidLifetimePurchases = (lifetimePurchases || []).filter(
      (p: any) => p.order_total_cents > 0 && p.payment_method !== 'free'
    );
    
    hasLifetimeAccess = paidLifetimePurchases.length > 0;
  }

  const userPlan = getUserPlan(user, subscription, hasLifetimeAccess);

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
          {/* Breadcrumb mejorado */}
          <nav className="flex items-center gap-3 mb-8 flex-wrap">
            <Link 
              href="/blog" 
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-900/50 transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-500 group-hover:text-apidevs-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Blog</span>
            </Link>
            
            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            
            {post.categories && post.categories.length > 0 && (
              <>
                <Link 
                  href="/blog"
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-900/50 transition-all duration-200"
                >
                  {post.categories[0].icon && (
                    <span className="text-sm">{post.categories[0].icon}</span>
                  )}
                  <span className="text-sm font-medium text-gray-400 group-hover:text-apidevs-primary transition-colors">
                    {post.categories[0].title}
                  </span>
                </Link>
                
                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            
            <span className="text-sm text-gray-500 font-medium line-clamp-1 max-w-md">
              {post.title}
            </span>
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
                  <PostContent 
                    content={post.content}
                    visibility={post.visibility as 'public' | 'authenticated' | 'premium'}
                    userPlan={userPlan as 'guest' | 'free' | 'pro' | 'lifetime'}
                    user={user}
                    subscription={subscription}
                    hasLifetimeAccess={hasLifetimeAccess}
                  />
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
              {/* Access Card - SIEMPRE VISIBLE EN LA PARTE SUPERIOR */}
              <PostAccessCard 
                userPlan={userPlan as 'guest' | 'free' | 'pro' | 'lifetime'}
                user={user}
                subscription={subscription}
                hasLifetimeAccess={hasLifetimeAccess}
                visibility={post.visibility as 'public' | 'authenticated' | 'premium'}
              />

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

