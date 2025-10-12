'use client';

import Link from 'next/link';
import Image from 'next/image';
import DocsSearch from './DocsSearch';

export default function DocsHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-apidevs-dark/95 border-b border-gray-800/50 z-50 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logos/logo-horizontal-blanco.png" 
              alt="APIDevs" 
              width={120}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>
          
          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm font-medium text-white hover:text-apidevs-primary transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Guides
            </Link>
            <Link
              href="/indicadores"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              API Reference
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Changelog
            </Link>
          </nav>
        </div>

        {/* Search + CTA */}
        <div className="flex items-center gap-3">
          <DocsSearch />
          <Link
            href="/signin"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-apidevs-primary hover:bg-apidevs-primary/90 text-black font-semibold rounded-lg transition-all text-sm shadow-lg shadow-apidevs-primary/20"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
