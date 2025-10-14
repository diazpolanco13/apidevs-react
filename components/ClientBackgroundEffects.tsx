'use client';

import dynamic from 'next/dynamic';

const BackgroundEffects = dynamic(
  () => import('@/components/ui/BackgroundEffects/BackgroundEffects'),
  { ssr: false }
);

export default function ClientBackgroundEffects({
  variant = 'minimal',
  showGrid = false,
  showParticles = true
}: {
  variant?: 'hero' | 'section' | 'minimal' | 'showcase';
  showGrid?: boolean;
  showParticles?: boolean;
}) {
  return <BackgroundEffects variant={variant} showGrid={showGrid} showParticles={showParticles} />;
}