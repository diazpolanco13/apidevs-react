import CSSParticles from '@/components/ui/SpaceParticles/CSSParticles';

interface BackgroundEffectsProps {
  variant?: 'hero' | 'section' | 'minimal';
  showGrid?: boolean;
  showParticles?: boolean;
  className?: string;
}

export default function BackgroundEffects({ 
  variant = 'section', 
  showGrid = true,
  showParticles = true,
  className = ''
}: BackgroundEffectsProps) {
  const getEffectsByVariant = () => {
    switch (variant) {
      case 'hero':
        return (
          <>
            {/* Grid Pattern */}
            {showGrid && (
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            )}
            {/* Hero specific blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-apidevs-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-apidevs-primary/3 rounded-full blur-3xl animate-float [animation-delay:3s]" />
          </>
        );
      
      case 'section':
        return (
          <>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-apidevs-dark via-apidevs-gray/5 to-apidevs-dark" />
            {/* Grid Pattern */}
            {showGrid && (
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            )}
            {/* Section specific blobs */}
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-apidevs-primary/4 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-apidevs-primary/6 rounded-full blur-3xl animate-float-reverse [animation-delay:2s]" />
            <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-apidevs-primary/3 rounded-full blur-3xl animate-float [animation-delay:1.5s]" />
          </>
        );
      
      case 'minimal':
        return (
          <>
            {/* Grid Pattern */}
            {showGrid && (
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            )}
            {/* Minimal blobs */}
            <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-apidevs-primary/2 rounded-full blur-3xl animate-float [animation-delay:4s]" />
            <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-apidevs-primary/3 rounded-full blur-3xl animate-float-reverse [animation-delay:1s]" />
          </>
        );
      
      default:
        return null;
    }
  };

  const getParticleVariant = () => {
    switch (variant) {
      case 'hero':
        return 'stars';
      case 'section':
        return 'nebula';
      case 'minimal':
        return 'minimal';
      default:
        return 'stars';
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {getEffectsByVariant()}
      {showParticles && (
        <CSSParticles variant={getParticleVariant()} />
      )}
    </div>
  );
}
