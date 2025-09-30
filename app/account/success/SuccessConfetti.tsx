'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function SuccessConfetti() {
  useEffect(() => {
    // Confetti burst inmediato
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#00FF00', '#00E676', '#76FF03', '#FFFFFF'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Explosión central grande
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: colors
      });
    }, 200);
  }, []);

  return null;
}

