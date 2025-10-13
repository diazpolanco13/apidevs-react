import { client } from '@/sanity/lib/client';
import {
  BLOG_POSTS_QUERY,
  FEATURED_POSTS_QUERY,
  BLOG_CATEGORIES_QUERY,
  type BlogPostCard,
  type BlogCategory,
} from '@/sanity/lib/blog-queries';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import BlogContent from '@/components/blog/BlogContent';

// ISR: Revalidar cada hora
export const revalidate = 3600;

export const metadata = {
  title: 'Blog - APIDevs | Análisis de Trading y Estrategias de Mercado',
  description: 'Artículos, tutoriales y análisis técnico sobre trading, indicadores y estrategias de mercado. Aprende con expertos traders de APIDevs.',
  openGraph: {
    title: 'Blog APIDevs | Trading & Análisis Técnico',
    description: 'Artículos y tutoriales sobre trading, indicadores y estrategias de mercado.',
    type: 'website',
  },
};

async function getBlogData() {
  try {
    const [featuredPosts, recentPosts, categories] = await Promise.all([
      client.fetch(FEATURED_POSTS_QUERY, { language: 'es' }, {
        next: { revalidate: 3600, tags: ['blog-featured'] },
      }),
      client.fetch(BLOG_POSTS_QUERY, { language: 'es', limit: 12 }, {
        next: { revalidate: 3600, tags: ['blog-posts'] },
      }),
      client.fetch(BLOG_CATEGORIES_QUERY, { language: 'es' }, {
        next: { revalidate: 3600, tags: ['blog-categories'] },
      }),
    ]);

    return {
      featuredPosts: featuredPosts as BlogPostCard[],
      recentPosts: recentPosts as BlogPostCard[],
      categories: categories as BlogCategory[],
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      featuredPosts: [],
      recentPosts: [],
      categories: [],
    };
  }
}

export default async function BlogPage() {
  const { featuredPosts, recentPosts, categories } = await getBlogData();

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundEffects />
      
      <div className="relative z-10 min-h-screen pt-20 pb-20">
        <BlogContent 
          featuredPosts={featuredPosts}
          recentPosts={recentPosts}
          categories={categories}
        />
      </div>
    </div>
  );
}

