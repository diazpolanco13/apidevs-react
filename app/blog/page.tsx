import { Suspense } from 'react';
import { client } from '@/sanity/lib/client';
import {
  BLOG_POSTS_QUERY,
  FEATURED_POSTS_QUERY,
  BLOG_CATEGORIES_QUERY,
  type BlogPostCard,
  type BlogCategory,
} from '@/sanity/lib/blog-queries';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';

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
    <div className="min-h-screen relative">
      <BackgroundEffects variant="minimal" />
      
      {/* Hero Section con Post Destacado */}
      {featuredPosts.length > 0 && (
        <Suspense fallback={<div className="h-96 bg-gray-900/20 animate-pulse" />}>
          <BlogHero post={featuredPosts[0]} />
        </Suspense>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20 relative z-10">
        {/* Section Title */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Últimos Artículos
          </h2>
          <p className="text-gray-400 text-lg">
            Descubre las últimas estrategias, análisis y tutoriales de trading
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Posts Grid */}
          <main className="flex-1">
            {recentPosts.length > 0 ? (
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-gray-900/20 rounded-xl animate-pulse" />
                  ))}
                </div>
              }>
                <BlogGrid 
                  posts={recentPosts} 
                  categories={categories}
                />
              </Suspense>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Próximamente
                </h2>
                <p className="text-gray-400 mb-8">
                  Estamos preparando contenido increíble para ti.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 max-w-2xl mx-auto text-left">
                  <p className="text-yellow-200 mb-2">
                    <strong>💡 Nota:</strong> El contenido está en borradores.
                  </p>
                  <p className="text-gray-300 text-sm">
                    Para ver los posts, ve a <code className="bg-gray-900 px-2 py-1 rounded">/studio</code> y publica los artículos desde la sección <strong>📝 Blog</strong>.
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block w-80 space-y-6">
            {/* Categorías */}
            {categories.length > 0 && (
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                <h3 className="text-lg font-bold text-white mb-4">
                  Categorías
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <a
                      key={category._id}
                      href={`/blog/category/${category.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon || '📂'}</span>
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {category.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {category.postCount}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-apidevs-primary/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-apidevs-primary/20">
              <h3 className="text-lg font-bold text-white mb-2">
                📬 Newsletter
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Recibe los mejores artículos de trading directamente en tu email.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-apidevs-primary transition-colors"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-apidevs-primary hover:bg-apidevs-primary-dark text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  Suscribirme
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

