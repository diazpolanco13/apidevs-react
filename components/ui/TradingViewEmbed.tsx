'use client';

interface TradingViewEmbedProps {
  embedUrl: string;
  title: string;
  className?: string;
  height?: string | number;
}

export default function TradingViewEmbed({ 
  embedUrl, 
  title, 
  className = '',
  height = 600
}: TradingViewEmbedProps) {
  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        width="100%"
        height={height}
        frameBorder="0"
        allowFullScreen
        style={{ border: 0 }}
        loading="lazy"
        className="w-full"
      />
    </div>
  );
}

