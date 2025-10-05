/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zzieiqxlxfydvexalbsr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Excluir la carpeta docs-site del build de Next.js
  experimental: {
    exclude: ['docs-site/**'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Excluir docs-site del procesamiento de Next.js
    config.module.rules.push({
      test: /\.mdx?$/,
      include: (resourcePath) => {
        return !resourcePath.includes('/docs-site/');
      },
    });

    return config;
  },
};

module.exports = nextConfig;

