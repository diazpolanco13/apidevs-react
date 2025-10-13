'use client';

import { Author } from '@/sanity/lib/blog-queries';

interface AuthorCardProps {
  author: Author;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-800/50">
      <h3 className="text-lg font-bold text-white mb-6">Sobre el Autor</h3>
      
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        {author.avatar && (
          <div className="flex-shrink-0">
            <img
              src={author.avatar.asset.url}
              alt={author.name}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-800"
            />
          </div>
        )}
        
        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-xl font-bold text-white">{author.name}</h4>
            {author.role && (
              <p className="text-sm text-apidevs-primary">{author.role}</p>
            )}
          </div>
          
          {author.bio && (
            <p className="text-gray-400 leading-relaxed">
              {author.bio}
            </p>
          )}
          
          {/* Expertise tags */}
          {author.expertise && author.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {author.expertise.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          
          {/* Social links */}
          {author.social && (
            <div className="flex gap-3 pt-2">
              {author.social.twitter && (
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-apidevs-primary transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-apidevs-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              {author.social.tradingview && (
                <a
                  href={author.social.tradingview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-apidevs-primary transition-colors"
                  aria-label="TradingView"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 17.25h-3v-9h3v9zm4.5 0h-3v-12h3v12zm4.5 0h-3v-6h3v6z" />
                  </svg>
                </a>
              )}
              {author.social.website && (
                <a
                  href={author.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-apidevs-primary transition-colors"
                  aria-label="Website"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

