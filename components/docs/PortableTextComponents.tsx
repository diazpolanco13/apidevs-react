'use client';

import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';

// Generar ID único para headings
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      const imageUrl = urlForImage(value)?.width(1200).height(800).url();
      return imageUrl ? (
        <figure className="my-8">
          <div className="rounded-xl overflow-hidden border border-gray-800 shadow-xl">
            <Image
              src={imageUrl}
              alt={value.alt || 'Documentation image'}
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
          {value.caption && (
            <figcaption className="text-sm text-gray-400 mt-3 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      ) : null;
    },
    codeBlock: ({ value }: any) => {
      return (
        <div className="my-6 group relative">
          {value.filename && (
            <div className="bg-gray-900 border border-gray-800 border-b-0 rounded-t-lg px-4 py-2 text-xs text-gray-400 font-mono">
              {value.filename}
            </div>
          )}
          <div className="relative">
            <pre className={`bg-gray-950 border border-gray-800 p-4 overflow-x-auto text-sm leading-relaxed ${
              value.filename ? 'rounded-b-lg' : 'rounded-lg'
            }`}>
              <code className="text-gray-300 font-mono">{value.code}</code>
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(value.code);
              }}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-md flex items-center gap-2"
              title="Copy code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
        </div>
      );
    },
    callout: ({ value }: any) => {
      const typeStyles = {
        info: {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: '💡',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400'
        },
        warning: {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          icon: '⚠️',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400'
        },
        error: {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: '🚨',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400'
        },
        success: {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          icon: '✅',
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400'
        },
        note: {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          icon: '📝',
          iconBg: 'bg-purple-500/20',
          iconColor: 'text-purple-400'
        }
      };

      const style = typeStyles[value.type as keyof typeof typeStyles] || typeStyles.info;

      return (
        <div className={`my-6 p-4 rounded-lg border ${style.bg} ${style.border}`}>
          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center text-lg`}>
              {style.icon}
            </div>
            <div className="flex-1">
              {value.title && (
                <div className={`font-semibold mb-1 ${style.iconColor}`}>
                  {value.title}
                </div>
              )}
              <div className="text-gray-300 text-sm leading-relaxed">
                {value.content}
              </div>
            </div>
          </div>
        </div>
      );
    }
  },
  block: {
    h1: ({ children, value }: any) => {
      const text = children?.[0] || '';
      const id = generateId(typeof text === 'string' ? text : '');
      return (
        <h1 id={id} className="text-4xl font-bold text-white mt-12 mb-6 scroll-mt-20 flex items-center gap-3 group">
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-apidevs-primary">
            #
          </a>
          {children}
        </h1>
      );
    },
    h2: ({ children, value }: any) => {
      const text = children?.[0] || '';
      const id = generateId(typeof text === 'string' ? text : '');
      return (
        <h2 id={id} className="text-3xl font-bold text-white mt-10 mb-5 scroll-mt-20 flex items-center gap-3 group">
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-apidevs-primary">
            #
          </a>
          <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
          {children}
        </h2>
      );
    },
    h3: ({ children, value }: any) => {
      const text = children?.[0] || '';
      const id = generateId(typeof text === 'string' ? text : '');
      return (
        <h3 id={id} className="text-2xl font-bold text-white mt-8 mb-4 scroll-mt-20 flex items-center gap-3 group">
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-apidevs-primary">
            #
          </a>
          {children}
        </h3>
      );
    },
    h4: ({ children, value }: any) => {
      const text = children?.[0] || '';
      const id = generateId(typeof text === 'string' ? text : '');
      return (
        <h4 id={id} className="text-xl font-semibold text-white mt-6 mb-3 scroll-mt-20 flex items-center gap-3 group">
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-apidevs-primary">
            #
          </a>
          {children}
        </h4>
      );
    },
    normal: ({ children }: any) => (
      <p className="text-gray-300 text-base leading-relaxed mb-6">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-apidevs-primary pl-6 py-4 my-6 bg-gray-900/50 rounded-r-lg">
        <div className="text-gray-200 italic">{children}</div>
      </blockquote>
    )
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-none space-y-2 my-6 ml-4">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 my-6 ml-4 text-gray-300">
        {children}
      </ol>
    )
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-3 text-gray-300">
        <svg className="w-5 h-5 text-apidevs-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>{children}</span>
      </li>
    ),
    number: ({ children }: any) => (
      <li className="text-gray-300">
        {children}
      </li>
    )
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-200">{children}</em>
    ),
    code: ({ children }: any) => (
      <code className="bg-gray-900 text-apidevs-primary px-2 py-1 rounded text-sm font-mono border border-gray-800">
        {children}
      </code>
    ),
    underline: ({ children }: any) => (
      <u className="underline decoration-apidevs-primary">{children}</u>
    ),
    'strike-through': ({ children }: any) => (
      <s className="line-through text-gray-500">{children}</s>
    ),
    link: ({ children, value }: any) => {
      const isExternal = value.href?.startsWith('http');
      return (
        <a
          href={value.href}
          target={value.blank || isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-apidevs-primary hover:text-apidevs-primary-dark underline decoration-1 underline-offset-2 transition-colors"
        >
          {children}
          {isExternal && (
            <svg className="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </a>
      );
    }
  }
};

