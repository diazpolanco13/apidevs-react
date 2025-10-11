'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryImage {
  asset: {
    _id: string;
    url: string;
    metadata: {
      lqip?: string;
      dimensions: {
        width: number;
        height: number;
      };
    };
  };
  alt?: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'unset';
  };

  const zoomIn = () => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.5, 3);
      console.log('Zoom In - New scale:', newScale);
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      console.log('Zoom Out - New scale:', newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const goToNext = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
      resetZoom();
    }
  };

  const goToPrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
      resetZoom();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-') zoomOut();
  };

  return (
    <>
      {/* Grid de imágenes en miniaturas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="group relative rounded-xl overflow-hidden border border-gray-800 hover:border-apidevs-primary/50 transition-all duration-300 cursor-pointer aspect-video bg-gray-900"
          >
            <Image
              src={image.asset.url}
              alt={image.alt || `Galería ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={idx < 3}
            />
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                <span className="text-white text-sm font-medium">Click para ampliar</span>
              </div>
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 z-10">
                <p className="text-xs text-white line-clamp-1">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 text-white hover:text-green-400 transition-colors p-2 bg-black/50 rounded-full backdrop-blur-sm"
            aria-label="Cerrar"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {selectedImage > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-6 z-50 text-white hover:text-green-400 transition-colors p-3 bg-black/50 rounded-full backdrop-blur-sm"
              aria-label="Anterior"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {selectedImage < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-6 z-50 text-white hover:text-green-400 transition-colors p-3 bg-black/50 rounded-full backdrop-blur-sm"
              aria-label="Siguiente"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-6 left-6 z-50 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              className="text-white hover:text-apidevs-primary transition-colors p-2 bg-black/50 rounded-full backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Acercar"
              disabled={scale >= 3}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              className="text-white hover:text-apidevs-primary transition-colors p-2 bg-black/50 rounded-full backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Alejar"
              disabled={scale <= 1}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            {scale > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                }}
                className="text-white hover:text-apidevs-primary transition-colors p-2 bg-black/50 rounded-full backdrop-blur-sm"
                aria-label="Restablecer zoom"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>

          {/* Zoom Level Indicator */}
          {scale > 1 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <p className="text-white text-sm font-medium">
                Zoom: {Math.round(scale * 100)}%
              </p>
            </div>
          )}

          {/* Image container */}
          <div
            className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden px-20"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
          >
            <div
              className={`relative ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                willChange: 'transform'
              }}
            >
              <img
                src={images[selectedImage].asset.url}
                alt={images[selectedImage].alt || `Galería ${selectedImage + 1}`}
                className="max-h-[80vh] max-w-[80vw] w-auto h-auto rounded-lg object-contain"
                style={{
                  display: 'block',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  pointerEvents: 'none'
                } as React.CSSProperties}
                draggable={false}
                onLoad={() => console.log('Image loaded, current scale:', scale)}
              />
            </div>

            {/* Caption */}
            {images[selectedImage].caption && scale === 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg pointer-events-none z-10">
                <p className="text-white text-center text-lg">
                  {images[selectedImage].caption}
                </p>
              </div>
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <p className="text-white text-sm font-medium">
              {selectedImage + 1} / {images.length}
            </p>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 text-sm flex items-center gap-3 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <span>ESC cerrar</span>
            <span>•</span>
            <span>← → navegar</span>
            <span>•</span>
            <span>Rueda del ratón = zoom</span>
            {scale > 1 && (
              <>
                <span>•</span>
                <span>Arrastra para mover</span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

