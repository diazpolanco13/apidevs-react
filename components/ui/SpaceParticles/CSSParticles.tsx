'use client';

interface CSSParticlesProps {
  variant?: 'stars' | 'nebula' | 'minimal';
  className?: string;
}

export default function CSSParticles({ variant = 'stars', className = '' }: CSSParticlesProps) {
  // Configuración por variante
  const getConfig = () => {
    switch (variant) {
      case 'stars':
        return { count: 50, minSize: 1, maxSize: 3, minDuration: 5, maxDuration: 15 };
      case 'nebula':
        return { count: 30, minSize: 2, maxSize: 4, minDuration: 8, maxDuration: 20 };
      case 'minimal':
        return { count: 20, minSize: 1, maxSize: 2, minDuration: 10, maxDuration: 25 };
      default:
        return { count: 50, minSize: 1, maxSize: 3, minDuration: 5, maxDuration: 15 };
    }
  };

  const config = getConfig();
  
  // Generar posiciones aleatorias para las partículas
  const particles = Array.from({ length: config.count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * (config.maxSize - config.minSize) + config.minSize,
    duration: Math.random() * (config.maxDuration - config.minDuration) + config.minDuration,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-apidevs-primary animate-float-particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: variant === 'minimal' ? 0.3 : variant === 'nebula' ? 0.5 : 0.6,
          }}
        />
      ))}
    </div>
  );
}
