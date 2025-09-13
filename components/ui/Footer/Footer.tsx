import Link from 'next/link';
import { 
  Shield, 
  Star, 
  Users, 
  TrendingUp, 
  Mail, 
  MessageCircle,
  Github,
  Twitter,
  Youtube
} from 'lucide-react';
import APIDevsLogo from '@/components/icons/APIDevsLogo';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-apidevs-dark to-black border-t border-gray-800">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-apidevs-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo y descripción */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <APIDevsLogo className="h-8 w-auto" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Plataforma líder en indicadores de trading con IA. Únete a más de 3,500 traders profesionales.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/diazpolanco13" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-apidevs-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-apidevs-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-apidevs-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-apidevs-primary transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegación</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="#indicators" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Indicadores
                </Link>
              </li>
              <li>
                <Link href="#community" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Comunidad
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Política de Reembolso
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-apidevs-primary transition-colors text-sm">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto y Stats */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="w-4 h-4 mr-2 text-apidevs-primary" />
                soporte@apidevs.com
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <MessageCircle className="w-4 h-4 mr-2 text-apidevs-primary" />
                Discord 24/7
              </li>
            </ul>
            
            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                <div className="text-apidevs-primary font-bold text-sm">3,500+</div>
                <div className="text-gray-500 text-xs">Traders</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                <div className="text-apidevs-primary font-bold text-sm">100%</div>
                <div className="text-gray-500 text-xs">Riesgo Cero</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges de confianza */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-800 rounded-full">
              <Shield className="w-4 h-4 text-apidevs-primary mr-2" />
              <span className="text-sm text-gray-300">100% Riesgo Cero</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-800 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-300">3,500+ Traders</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-800 rounded-full">
              <Users className="w-4 h-4 text-apidevs-primary mr-2" />
              <span className="text-sm text-gray-300">Cancelación Inmediata</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-800 rounded-full">
              <TrendingUp className="w-4 h-4 text-apidevs-primary mr-2" />
              <span className="text-sm text-gray-300">18 Indicadores VIP</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} APIDevs, Inc. Todos los derechos reservados.
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Crafted by</span>
              <a 
                href="https://vercel.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 hover:text-apidevs-primary transition-colors"
              >
                <img
                  src="/vercel.svg"
                  alt="Vercel"
                  className="inline-block h-4 opacity-50 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}