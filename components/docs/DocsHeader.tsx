'use client';

import DocsSearch from './DocsSearch';

export default function DocsHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-sm border-b border-gray-800 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold">
            <span className="bg-gradient-to-r from-apidevs-primary to-purple-500 bg-clip-text text-transparent">
              APIDevs
            </span>
          </a>
          
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/docs"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Documentation
            </a>
            <a
              href="/indicadores"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Indicators
            </a>
            <a
              href="/pricing"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
          </nav>
        </div>

        {/* Search + CTA */}
        <div className="flex items-center gap-4">
          <DocsSearch />
          <a
            href="/signin"
            className="hidden sm:block px-4 py-2 bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-semibold rounded-lg transition-colors text-sm"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

