'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Establecer fecha objetivo (48 horas desde ahora, renovándose cada 48 horas)
    const now = new Date();
    const targetTime = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 horas
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetTime.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Reiniciar el contador para las próximas 48 horas
        const newTarget = new Date(now.getTime() + (48 * 60 * 60 * 1000));
        targetTime.setTime(newTarget.getTime());
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/30 rounded-3xl p-6 backdrop-blur-xl max-w-4xl mx-auto shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Timer className="w-6 h-6 text-red-400 mr-2 animate-pulse" />
            <h3 className="text-2xl font-bold text-white">
              ¡Oferta Especial Termina En!
            </h3>
            <Timer className="w-6 h-6 text-red-400 ml-2 animate-pulse" />
          </div>
          
          <div className="flex justify-center space-x-4 mb-4">
            <div className="bg-black/50 rounded-2xl p-4 min-w-[80px] border border-red-500/30">
              <div className="text-3xl font-bold text-red-400">{timeLeft.days.toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-300 uppercase tracking-wider">Días</div>
            </div>
            <div className="bg-black/50 rounded-2xl p-4 min-w-[80px] border border-orange-500/30">
              <div className="text-3xl font-bold text-orange-400">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-300 uppercase tracking-wider">Horas</div>
            </div>
            <div className="bg-black/50 rounded-2xl p-4 min-w-[80px] border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-400">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-300 uppercase tracking-wider">Min</div>
            </div>
            <div className="bg-black/50 rounded-2xl p-4 min-w-[80px] border border-green-500/30">
              <div className="text-3xl font-bold text-green-400 animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-300 uppercase tracking-wider">Seg</div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">
              🔥 Descuento hasta 35% OFF
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium">
              ⚡ Solo 48 horas
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
              🎯 Últimas 127 plazas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
