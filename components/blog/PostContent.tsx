'use client';

import { PortableText } from '@portabletext/react';
import { urlForImage } from '@/sanity/lib/image';
import Image from 'next/image';
import CardGroup from './CardGroup';
import Tabs from './Tabs';
import Accordion from './Accordion';
import PostAccessCard from './PostAccessCard';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/types_db';

type Subscription = Tables<'subscriptions'>;

// Reutilizamos los componentes de docs pero adaptados para blog
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      
      const builder = urlForImage(value);
      const imageUrl = builder?.width(1200).height(800).url();
      
      return (
        <figure className="my-8">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={value.alt || ''}
                fill
                className="object-cover"
              />
            )}
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    
    codeBlock: ({ value }: any) => {
      return (
        <div className="my-8 rounded-xl overflow-hidden">
          {value.filename && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm text-gray-400 ml-2">{value.filename}</span>
            </div>
          )}
          <pre className="bg-gray-900 p-6 overflow-x-auto">
            <code className={`language-${value.language} text-sm text-gray-300`}>
              {value.code}
            </code>
          </pre>
        </div>
      );
    },
    
    callout: ({ value }: any) => {
      const typeStyles: Record<string, { container: string; icon: string }> = {
        info: {
          container: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
          icon: '💡',
        },
        success: {
          container: 'bg-green-500/10 border-green-500/30 text-green-300',
          icon: '✅',
        },
        warning: {
          container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
          icon: '⚠️',
        },
        error: {
          container: 'bg-red-500/10 border-red-500/30 text-red-300',
          icon: '🚨',
        },
        note: {
          container: 'bg-gray-500/10 border-gray-500/30 text-gray-300',
          icon: '📝',
        },
        tip: {
          container: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
          icon: '💡',
        },
      };
      
      const style = typeStyles[value.type || 'info'] || typeStyles.info;
      
      return (
        <div className={`my-6 p-4 rounded-lg border ${style.container} backdrop-blur-sm`}>
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">{style.icon}</span>
            <div className="flex-1">
              {value.title && (
                <h4 className="font-semibold mb-2">{value.title}</h4>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {value.content}
              </p>
            </div>
          </div>
        </div>
      );
    },
    
    videoEmbed: ({ value }: any) => {
      if (!value?.url) return null;
      
      return (
        <div className="my-8">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
            <iframe
              src={value.url}
              title={value.title || 'Video'}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
          {value.title && (
            <p className="mt-2 text-center text-sm text-gray-400">{value.title}</p>
          )}
        </div>
      );
    },
    
    // Nuevos componentes avanzados
    cardGroup: CardGroup,
    tabs: Tabs,
    accordion: Accordion,
  },
  
  block: {
    h2: ({ children }: any) => {
      headingCounter++;
      const headingId = `heading-${headingCounter}`;
      
      return (
        <h2 id={headingId} className="text-3xl font-bold text-white mt-12 mb-6 flex items-center gap-3 scroll-mt-20">
          <span className="w-1 h-8 bg-gradient-to-b from-apidevs-primary to-purple-400 rounded-full" />
          {children}
        </h2>
      );
    },
    h3: ({ children }: any) => {
      headingCounter++;
      const headingId = `heading-${headingCounter}`;
      
      return (
        <h3 id={headingId} className="text-2xl font-bold text-white mt-10 mb-4 scroll-mt-20">
          {children}
        </h3>
      );
    },
    h4: ({ children }: any) => {
      headingCounter++;
      const headingId = `heading-${headingCounter}`;
      
      return (
        <h4 id={headingId} className="text-xl font-semibold text-white mt-8 mb-3 scroll-mt-20">
          {children}
        </h4>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="my-6 pl-6 border-l-4 border-apidevs-primary italic text-gray-300">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="my-4 text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
  },
  
  list: {
    bullet: ({ children }: any) => (
      <ul className="my-6 space-y-2 list-none">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="my-6 space-y-2 list-decimal list-inside text-gray-300">
        {children}
      </ol>
    ),
  },
  
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-3 text-gray-300">
        <span className="text-apidevs-primary mt-1 flex-shrink-0">✓</span>
        <span>{children}</span>
      </li>
    ),
    number: ({ children }: any) => (
      <li className="text-gray-300">{children}</li>
    ),
  },
  
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: any) => (
      <code className="px-2 py-1 bg-gray-800 text-apidevs-primary rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => {
      const target = value?.blank ? '_blank' : undefined;
      const rel = value?.blank ? 'noopener noreferrer' : undefined;
      
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="text-apidevs-primary hover:text-apidevs-primary-dark underline transition-colors"
        >
          {children}
        </a>
      );
    },
    highlight: ({ children }: any) => (
      <mark className="bg-apidevs-primary/20 text-apidevs-primary px-1 rounded">
        {children}
      </mark>
    ),
  },
};

interface PostContentProps {
  content: any[];
  visibility?: 'public' | 'authenticated' | 'premium';
  userPlan: 'guest' | 'free' | 'pro' | 'lifetime';
  user: User | null;
  subscription: Subscription | null;
  hasLifetimeAccess: boolean;
}

// Crear un contador global para los headings
let headingCounter = -1;

export default function PostContent({ 
  content, 
  visibility = 'public',
  userPlan,
  user,
  subscription,
  hasLifetimeAccess 
}: PostContentProps) {
  // Resetear el contador al inicio del render
  headingCounter = -1;
  
  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay contenido disponible.</p>
      </div>
    );
  }

  // Determinar si el usuario tiene acceso
  const hasAccess = () => {
    // Contenido público: todos tienen acceso
    if (visibility === 'public') return true;
    
    // Contenido autenticado: solo usuarios logueados
    if (visibility === 'authenticated' && user) return true;
    
    // Contenido premium: solo PRO o Lifetime
    if (visibility === 'premium' && (userPlan === 'pro' || userPlan === 'lifetime')) return true;
    
    return false;
  };

  const canAccess = hasAccess();

  // Si no tiene acceso, mostrar preview limitado con gradiente
  if (!canAccess) {
    // Mostrar solo los primeros 2 bloques como preview
    const previewContent = content.slice(0, 2);
    
    return (
      <div className="prose-custom">
        {/* Preview del contenido */}
        <PortableText
          value={previewContent}
          components={portableTextComponents}
        />
        
        {/* Gradiente de difuminado que indica contenido bloqueado */}
        <div className="relative -mt-20 h-40 bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none" />
        
        {/* Mensaje sutil indicando que el contenido continúa en el sidebar */}
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">👉 Continúa leyendo desbloqueando el contenido premium</p>
        </div>
      </div>
    );
  }

  // Si tiene acceso, mostrar todo el contenido sin interrupciones
  return (
    <div className="prose-custom">
      <PortableText
        value={content}
        components={portableTextComponents}
      />
    </div>
  );
}

