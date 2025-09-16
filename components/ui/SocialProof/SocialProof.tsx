'use client';

import { Star } from 'lucide-react';

export default function SocialProof() {
  return (
    <div className="mt-16 mb-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Únete a <span className="text-transparent bg-clip-text bg-gradient-to-r from-apidevs-primary to-green-400">3,500+ Traders</span> que ya confían en nosotros
          </h2>
          <p className="text-gray-300 text-lg">Resultados reales de nuestra comunidad profesional</p>
        </div>
        
        {/* Métricas en tiempo real */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-apidevs-primary/10 to-green-500/10 border border-apidevs-primary/30 rounded-2xl p-6 text-center backdrop-blur-xl">
            <div className="text-3xl font-bold text-apidevs-primary mb-2">3,500+</div>
            <div className="text-gray-300 text-sm">Traders Activos</div>
            <div className="flex items-center justify-center mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-400 text-xs">+47 hoy</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 text-center backdrop-blur-xl">
            <div className="text-3xl font-bold text-blue-400 mb-2">18</div>
            <div className="text-gray-300 text-sm">Indicadores VIP</div>
            <div className="flex items-center justify-center mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-blue-400 text-xs">Exclusivos</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 text-center backdrop-blur-xl">
            <div className="text-3xl font-bold text-purple-400 mb-2">160</div>
            <div className="text-gray-300 text-sm">Criptos Scaneadas</div>
            <div className="flex items-center justify-center mt-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-purple-400 text-xs">24/7 Live</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center backdrop-blur-xl">
            <div className="text-3xl font-bold text-yellow-400 mb-2">99.2%</div>
            <div className="text-gray-300 text-sm">Satisfacción</div>
            <div className="flex items-center justify-center mt-2">
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <Star className="w-3 h-3 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Testimoniales rápidos */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-black/30 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center text-black font-bold text-lg mr-3">
                M
              </div>
              <div>
                <div className="text-white font-semibold">Miguel R.</div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm italic">
              "Los scanners de APIDevs me han ayudado a identificar oportunidades que antes pasaba por alto. +127% en 3 meses."
            </p>
          </div>
          
          <div className="bg-black/30 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-black font-bold text-lg mr-3">
                A
              </div>
              <div>
                <div className="text-white font-semibold">Ana L.</div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm italic">
              "La comunidad VIP es oro puro. Estrategias compartidas en tiempo real por traders profesionales."
            </p>
          </div>
          
          <div className="bg-black/30 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center text-black font-bold text-lg mr-3">
                C
              </div>
              <div>
                <div className="text-white font-semibold">Carlos M.</div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm italic">
              "Indicadores únicos que no encuentras en ningún otro lado. Vale cada centavo del plan Lifetime."
            </p>
          </div>
        </div>

        {/* Logos de exchanges */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Compatible con las principales plataformas de trading</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-white font-bold text-xl">TradingView</div>
            <div className="text-white font-bold text-xl">Binance</div>
            <div className="text-white font-bold text-xl">Bybit</div>
            <div className="text-white font-bold text-xl">OKX</div>
            <div className="text-white font-bold text-xl">Coinbase</div>
          </div>
        </div>
      </div>
    </div>
  );
}
