import Image from 'next/image';
import { urlFor } from '@/lib/sanity/client';
import type { PortableTextComponents } from '@portabletext/react';

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="my-8 rounded-xl overflow-hidden">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Imagen'}
            width={1200}
            height={675}
            className="w-full h-auto"
          />
          {value.caption && (
            <p className="text-center text-sm text-gray-400 mt-2 italic">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
    videoEmbed: ({ value }: any) => {
      const { url } = value;
      if (!url) return null;

      // Detectar si es YouTube o Vimeo y extraer ID
      let embedUrl = '';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be')
          ? url.split('youtu.be/')[1]
          : url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      if (!embedUrl) {
        return (
          <div className="my-8">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 underline"
            >
              Ver video
            </a>
          </div>
        );
      }

      return (
        <div className="my-8">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-bold text-white mt-12 mb-6">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl font-bold text-white mt-8 mb-3">{children}</h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-green-500 pl-6 py-4 my-6 italic text-gray-300 bg-gray-800/30 rounded-r-lg">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 my-6 text-gray-300">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 my-6 text-gray-300">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="ml-4">{children}</li>,
    number: ({ children }: any) => <li className="ml-4">{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-gray-800 px-2 py-1 rounded text-green-400 text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-400 hover:text-green-300 underline"
      >
        {children}
      </a>
    ),
  },
};

