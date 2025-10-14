import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { SEARCH_DOCS_QUERY, type SearchResult } from '@/sanity/lib/doc-queries';

// Next.js 15: Renderizado dinámico estándar (no requiere Edge Runtime)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Buscar en Sanity con GROQ
    const results = await client.fetch<SearchResult[]>(
      SEARCH_DOCS_QUERY,
      { searchTerm: query.trim() },
      {
        next: {
          revalidate: 60, // Cache por 1 minuto
          tags: ['docs-search']
        }
      }
    );

    return NextResponse.json({
      query,
      results,
      total: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search documentation' },
      { status: 500 }
    );
  }
}

