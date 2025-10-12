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
    // Fallback para tipos no implementados
    cardGroup: ({ value }: any) => (
      <div className="my-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">Card Group: {value?.title || 'Sin título'}</p>
      </div>
    ),
    tabs: ({ value }: any) => (
      <div className="my-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">Tabs: {value?.items?.length || 0} pestañas</p>
      </div>
    ),
    accordion: ({ value }: any) => (
      <div className="my-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">Accordion: {value?.title || 'Sin título'}</p>
      </div>
    ),
    videoEmbed: ({ value }: any) => (
      <div className="my-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">Video: {value?.url || 'Sin URL'}</p>
      </div>
    ),
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      
      const imageBuilder = urlForImage(value);
      if (!imageBuilder) return null;
      
      // Handle both builder types (direct URL or Sanity image builder)
      let imageUrl: string | undefined;
      try {
        const widthBuilder = imageBuilder.width(1600);
        if (typeof widthBuilder === 'object' && 'url' in widthBuilder) {
          imageUrl = (widthBuilder as any).url();
        } else if (typeof widthBuilder === 'object' && 'height' in widthBuilder) {
          const heightBuilder = (widthBuilder as any).height(900);
          imageUrl = heightBuilder?.url?.();
        }
      } catch (e) {
        console.error('Error building image URL:', e);
        return null;
      }
      
      return imageUrl ? (
        <figure className="my-10 group">
          <div className="relative rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-1">
            <div className="relative rounded-lg overflow-hidden bg-gray-950">
              <img
                src={imageUrl}
                alt={value.alt || 'Documentation image'}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Overlay sutil en hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
          {value.caption && (
            <figcaption className="text-sm text-gray-400 mt-4 text-center px-4">
              {value.caption}
            </figcaption>
          )}
        </figure>
      ) : null;
    },
    codeBlock: ({ value }: any) => {
      return (
        <div className="my-8 group relative">
          {/* Header con filename y lenguaje */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border border-gray-800/50 border-b-0 rounded-t-xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Dots de ventana estilo macOS */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              {value.filename && (
                <span className="text-xs text-gray-400 font-mono font-medium">
                  {value.filename}
                </span>
              )}
            </div>
            {value.language && (
              <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                {value.language}
              </span>
            )}
          </div>
          
          {/* Code container */}
          <div className="relative">
            <pre className="bg-gradient-to-br from-gray-950 via-black to-gray-950 border border-gray-800/50 rounded-b-xl p-6 overflow-x-auto shadow-2xl">
              <code className="text-gray-300 font-mono text-[13.5px] leading-[1.7] tracking-wide">
                {value.code}
              </code>
            </pre>
            
            {/* Copy button placeholder - will be interactive on client */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 px-3.5 py-2 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 text-xs font-medium rounded-lg flex items-center gap-2 border border-gray-700/50 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </div>
          </div>
        </div>
      );
    },
    callout: ({ value }: any) => {
      // Si no hay contenido, no renderizar nada
      if (!value?.content) {
        return null;
      }

      const typeStyles = {
        info: {
          bg: 'bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent',
          border: 'border-blue-500/40',
          borderLeft: 'border-l-blue-500',
          icon: '💡',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          glow: 'shadow-blue-500/20'
        },
        warning: {
          bg: 'bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent',
          border: 'border-yellow-500/40',
          borderLeft: 'border-l-yellow-500',
          icon: '⚠️',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          glow: 'shadow-yellow-500/20'
        },
        error: {
          bg: 'bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent',
          border: 'border-red-500/40',
          borderLeft: 'border-l-red-500',
          icon: '🚨',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          glow: 'shadow-red-500/20'
        },
        success: {
          bg: 'bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent',
          border: 'border-green-500/40',
          borderLeft: 'border-l-green-500',
          icon: '✅',
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          glow: 'shadow-green-500/20'
        },
        note: {
          bg: 'bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent',
          border: 'border-purple-500/40',
          borderLeft: 'border-l-purple-500',
          icon: '📝',
          iconBg: 'bg-purple-500/20',
          iconColor: 'text-purple-400',
          glow: 'shadow-purple-500/20'
        },
        tip: {
          bg: 'bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent',
          border: 'border-cyan-500/40',
          borderLeft: 'border-l-cyan-500',
          icon: '🎯',
          iconBg: 'bg-cyan-500/20',
          iconColor: 'text-cyan-400',
          glow: 'shadow-cyan-500/20'
        }
      };

      // Obtener el estilo según el tipo (default: info si no existe)
      const calloutType = value.type || 'info';
      const style = typeStyles[calloutType as keyof typeof typeStyles] || typeStyles.info;

      return (
        <div className={`my-8 p-5 rounded-xl border-l-4 ${style.bg} ${style.border} ${style.borderLeft} ${style.glow} shadow-lg backdrop-blur-sm`}>
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center text-xl shadow-inner`}>
              {style.icon}
            </div>
            <div className="flex-1 pt-0.5">
              {value.title && (
                <div className={`font-bold mb-2 text-base ${style.iconColor}`}>
                  {value.title}
                </div>
              )}
              <div className="text-gray-200 text-[15px] leading-relaxed">
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
        <h1 id={id} className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300 mt-16 mb-8 scroll-mt-20 group relative">
          <a href={`#${id}`} className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-all duration-200 text-apidevs-primary hover:scale-110 text-3xl">
            #
          </a>
          <div className="flex items-center gap-4">
            {children}
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-apidevs-primary to-transparent rounded-full mt-4"></div>
        </h1>
      );
    },
    h2: ({ children, value }: any) => {
      const text = children?.[0] || '';
      const id = generateId(typeof text === 'string' ? text : '');
      return (
        <h2 id={id} className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-20 group relative flex items-center gap-4">
          <a href={`#${id}`} className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-all duration-200 text-apidevs-primary hover:scale-110">
            #
          </a>
          <span className="w-1.5 h-10 bg-gradient-to-b from-apidevs-primary to-apidevs-primary-dark rounded-full shadow-lg shadow-apidevs-primary/50"></span>
          <span className="flex-1">{children}</span>
        </h2>
      );
    },
    h3: ({ children, value }: any) => {
      const text = children?.[0] || '';
      const id = generateId(typeof text === 'string' ? text : '');
      return (
        <h3 id={id} className="text-2xl font-bold text-white mt-12 mb-5 scroll-mt-20 group relative flex items-center gap-3">
          <a href={`#${id}`} className="absolute -left-7 opacity-0 group-hover:opacity-100 transition-all duration-200 text-apidevs-primary/80 hover:scale-110 text-lg">
            #
          </a>
          <span className="w-1 h-7 bg-gradient-to-b from-apidevs-primary/80 to-apidevs-primary/40 rounded-full"></span>
          <span className="flex-1">{children}</span>
        </h3>
      );
    },
    h4: ({ children, value }: any) => {
      const text = children?.[0] || '';
      const id = generateId(typeof text === 'string' ? text : '');
      return (
        <h4 id={id} className="text-xl font-semibold text-white mt-8 mb-4 scroll-mt-20 group relative flex items-center gap-3">
          <a href={`#${id}`} className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-all duration-200 text-apidevs-primary/60 hover:scale-110 text-base">
            #
          </a>
          <span className="w-0.5 h-6 bg-apidevs-primary/60 rounded-full"></span>
          <span className="flex-1">{children}</span>
        </h4>
      );
    },
    normal: ({ children }: any) => (
      <p className="text-gray-300 text-[15.5px] leading-[1.8] mb-6 tracking-wide">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="relative border-l-4 border-apidevs-primary pl-8 pr-6 py-5 my-8 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-transparent rounded-r-xl shadow-lg backdrop-blur-sm">
        <div className="absolute left-4 top-4 text-apidevs-primary/30 text-6xl font-serif leading-none">"</div>
        <div className="text-gray-200 italic text-[15px] leading-relaxed relative z-10 pt-4">{children}</div>
      </blockquote>
    )
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-none space-y-3 my-8 ml-2">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-none space-y-3 my-8 ml-2 counter-reset-list">
        {children}
      </ol>
    )
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-3.5 text-gray-300 group">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-apidevs-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-apidevs-primary/30 transition-colors">
          <svg className="w-3.5 h-3.5 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="flex-1 pt-0.5 text-[15px] leading-relaxed">{children}</span>
      </li>
    ),
    number: ({ children }: any) => (
      <li className="flex items-start gap-3.5 text-gray-300 counter-increment-item group">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-apidevs-primary/20 flex items-center justify-center text-xs font-bold text-apidevs-primary mt-0.5 group-hover:bg-apidevs-primary/30 transition-colors before:content-[counter(list-item)]">
        </div>
        <span className="flex-1 pt-0.5 text-[15px] leading-relaxed">{children}</span>
      </li>
    )
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-200 font-medium">{children}</em>
    ),
    code: ({ children }: any) => (
      <code className="relative inline-flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-apidevs-primary px-2.5 py-1 rounded-md text-[13.5px] font-mono border border-gray-700/50 shadow-inner before:absolute before:inset-0 before:bg-apidevs-primary/5 before:rounded-md">
        {children}
      </code>
    ),
    underline: ({ children }: any) => (
      <u className="underline decoration-apidevs-primary/60 decoration-2 underline-offset-4 hover:decoration-apidevs-primary transition-colors">{children}</u>
    ),
    'strike-through': ({ children }: any) => (
      <s className="line-through decoration-2 text-gray-500">{children}</s>
    ),
    link: ({ children, value }: any) => {
      const isExternal = value.href?.startsWith('http');
      return (
        <a
          href={value.href}
          target={value.blank || isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-1 text-apidevs-primary hover:text-apidevs-primary-dark font-medium underline decoration-apidevs-primary/40 decoration-1 underline-offset-4 hover:decoration-apidevs-primary transition-all duration-200 hover:gap-1.5"
        >
          {children}
          {isExternal && (
            <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </a>
      );
    }
  }
};

