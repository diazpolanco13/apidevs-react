'use client';

import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';

interface ImageClientProps {
  value: any;
}

export default function ImageClient({ value }: ImageClientProps) {
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
          <Image
            src={imageUrl}
            alt={value.alt || 'Documentation image'}
            width={1600}
            height={900}
            className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
            quality={95}
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
}
