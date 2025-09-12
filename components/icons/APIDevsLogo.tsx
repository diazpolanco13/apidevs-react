'use client';

import Image from 'next/image';

interface APIDevsLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const APIDevsLogo = ({ 
  className = '', 
  width = 200, 
  height = 60 
}: APIDevsLogoProps) => {
  return (
    <Image
      src="/logos/logo-horizontal-blanco.png"
      alt="APIDevs Trading"
      width={width}
      height={height}
      className={`transition-opacity duration-300 hover:opacity-80 cursor-pointer ${className}`}
      priority
    />
  );
};

export default APIDevsLogo;
