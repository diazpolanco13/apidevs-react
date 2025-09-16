import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Cookies | APIDevs Trading Platform',
  description: 'Política de cookies de APIDevs Trading Platform. Conoce qué cookies utilizamos y cómo puedes gestionarlas.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark relative">
      {/* Background Effects - Extended to Full Page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-red-500/8 rounded-full blur-3xl"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Política de 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"> Cookies</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Conoce qué cookies utilizamos en APIDevs Trading Platform, cómo las usamos y cómo puedes gestionar tus preferencias.
          </p>
          <div className="mt-8">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-yellow-500 text-black font-semibold rounded-2xl hover:bg-yellow-400 transition-colors"
            >
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </section>

      {/* Cookies Content */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 z-10">
        <article className="bg-black/30 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 md:p-12">
          
          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">1</span>
              ¿Qué son las Cookies?
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                Esta Política de Cookies explica qué son las Cookies y cómo las utilizamos. Debes leer esta política para que puedas comprender qué tipo de cookies utilizamos, o la información que recopilamos utilizando Cookies y cómo se utiliza esa información.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Las Cookies normalmente no contienen ninguna información que identifique personalmente a un usuario, pero la información personal que almacenamos sobre ti puede estar vinculada a la información almacenada y obtenida de las Cookies.
              </p>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-green-400 mb-2">🔒 Seguridad de Datos</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  No almacenamos información personal sensible, como direcciones postales, contraseñas de cuentas, etc. en las Cookies que utilizamos.
                </p>
              </div>
            </div>
          </section>

          {/* Definitions */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">2</span>
              Definiciones
            </h2>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Para los propósitos de esta Política de Cookies:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="text-orange-400 font-semibold mb-2">🏢 Empresa</h4>
                    <p className="text-gray-300 text-sm">Se refiere a <strong>APIDEVS LLC</strong> ("Nosotros", "Nos" o "Nuestro")</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">🌐 Sitio Web</h4>
                    <p className="text-gray-300 text-sm">Se refiere a <strong>APIDEVS</strong>, accesible desde nuestro dominio principal</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <h4 className="text-amber-400 font-semibold mb-2">🍪 Cookies</h4>
                    <p className="text-gray-300 text-sm">Archivos pequeños que se colocan en tu dispositivo por un sitio web, que contienen detalles de tu historial de navegación</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <h4 className="text-red-400 font-semibold mb-2">👤 Tú</h4>
                    <p className="text-gray-300 text-sm">El individuo que accede o utiliza el Sitio Web</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Types of Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">3</span>
              Tipos de Cookies que Utilizamos
            </h2>
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed mb-6">
                Las Cookies pueden ser <strong className="text-apidevs-primary">"Persistentes"</strong> o <strong className="text-blue-400">"de Sesión"</strong>. Las Cookies Persistentes permanecen en tu dispositivo cuando te desconectas, mientras que las Cookies de Sesión se eliminan tan pronto como cierras tu navegador.
              </p>
              
              {/* Essential Cookies */}
              <div className="bg-gradient-to-br from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-apidevs-primary/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-apidevs-primary">Cookies Necesarias / Esenciales</h3>
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>Tipo: <strong className="text-apidevs-primary">Sesión</strong></span>
                      <span>Administradas: <strong className="text-apidevs-primary">Nosotros</strong></span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Estas Cookies son esenciales para proporcionarte servicios disponibles a través del Sitio Web y para permitirte usar algunas de sus características. Ayudan a autenticar usuarios y prevenir el uso fraudulento de cuentas de usuario.
                </p>
              </div>

              {/* Policy Acceptance Cookies */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400">Cookies de Aceptación de Política</h3>
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>Tipo: <strong className="text-blue-400">Persistentes</strong></span>
                      <span>Administradas: <strong className="text-blue-400">Nosotros</strong></span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Estas Cookies identifican si los usuarios han aceptado el uso de cookies en el Sitio Web.
                </p>
              </div>

              {/* Functionality Cookies */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-400/10 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400">Cookies de Funcionalidad</h3>
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>Tipo: <strong className="text-purple-400">Persistentes</strong></span>
                      <span>Administradas: <strong className="text-purple-400">Nosotros</strong></span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Estas Cookies nos permiten recordar las elecciones que haces cuando usas el Sitio Web, como recordar tus detalles de inicio de sesión o preferencia de idioma. El propósito es proporcionarte una experiencia más personal.
                </p>
              </div>

              {/* Performance Cookies */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-400/10 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.5 4a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zm-3 2.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-400">Cookies de Seguimiento y Rendimiento</h3>
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>Tipo: <strong className="text-yellow-400">Persistentes</strong></span>
                      <span>Administradas: <strong className="text-yellow-400">Terceros</strong></span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Estas Cookies se utilizan para rastrear información sobre el tráfico al Sitio Web y cómo los usuarios usan el Sitio Web. También podemos usar estas Cookies para probar nuevos anuncios, páginas, características o nueva funcionalidad.
                </p>
              </div>

              {/* Advertising Cookies */}
              <div className="bg-gradient-to-br from-red-500/10 to-pink-400/10 border border-red-500/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-red-400">Cookies de Segmentación y Publicidad</h3>
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>Tipo: <strong className="text-red-400">Persistentes</strong></span>
                      <span>Administradas: <strong className="text-red-400">Terceros</strong></span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Estas Cookies rastrean tus hábitos de navegación para permitirnos mostrar publicidad que es más probable que sea de tu interés. Usan información sobre tu historial de navegación para agruparte con otros usuarios que tienen intereses similares.
                </p>
              </div>

              {/* Social Media Cookies */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-blue-400/10 border border-indigo-500/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-400">Cookies de Redes Sociales</h3>
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>Tipo: <strong className="text-indigo-400">Persistentes</strong></span>
                      <span>Administradas: <strong className="text-indigo-400">Terceros</strong></span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  También podemos usar varias Cookies de terceros para informar estadísticas de uso del Sitio Web, entregar anuncios y así sucesivamente. Estas Cookies pueden usarse cuando compartes información usando sitios de redes sociales como Facebook, Instagram, Twitter o Google+.
                </p>
              </div>
            </div>
          </section>

          {/* Your Choices */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">4</span>
              Tus Opciones con las Cookies
            </h2>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Si prefieres evitar el uso de Cookies en el Sitio Web, primero debes desactivar el uso de Cookies en tu navegador y luego eliminar las Cookies guardadas en tu navegador asociadas con este sitio web.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Importante</h4>
                <p className="text-gray-300 text-sm">
                  Si no aceptas nuestras Cookies, puedes experimentar alguna inconveniencia en tu uso del Sitio Web y algunas características pueden no funcionar correctamente.
                </p>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Si deseas eliminar Cookies o instruir a tu navegador web para que elimine o rechace Cookies, visita las páginas de ayuda de tu navegador web.
              </p>
            </div>
          </section>

          {/* Browser Instructions */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">5</span>
              Gestionar Cookies por Navegador
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <a 
                  href="https://support.google.com/accounts/answer/32050" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-red-500/10 to-yellow-500/10 border border-red-500/30 rounded-xl p-4 hover:border-red-500/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-red-400 font-bold text-sm">C</span>
                    </div>
                    <div>
                      <h4 className="text-red-400 font-semibold">Google Chrome</h4>
                      <p className="text-gray-400 text-xs">Gestionar cookies en Chrome</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="https://support.mozilla.org/es/kb/eliminar-cookies" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-orange-400 font-bold text-sm">F</span>
                    </div>
                    <div>
                      <h4 className="text-orange-400 font-semibold">Mozilla Firefox</h4>
                      <p className="text-gray-400 text-xs">Eliminar cookies en Firefox</p>
                    </div>
                  </div>
                </a>
              </div>
              
              <div className="space-y-4">
                <a 
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-blue-500/30 rounded-xl p-4 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-400 font-bold text-sm">S</span>
                    </div>
                    <div>
                      <h4 className="text-blue-400 font-semibold">Safari</h4>
                      <p className="text-gray-400 text-xs">Gestionar cookies en Safari</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="http://support.microsoft.com/kb/278835" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-indigo-500/10 to-blue-400/10 border border-indigo-500/30 rounded-xl p-4 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-indigo-400 font-bold text-sm">IE</span>
                    </div>
                    <div>
                      <h4 className="text-indigo-400 font-semibold">Internet Explorer</h4>
                      <p className="text-gray-400 text-xs">Configurar cookies en IE</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* More Information */}
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">6</span>
              Más Información sobre Cookies
            </h2>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-400/10 border border-green-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Puedes obtener más información sobre cookies en:
              </p>
              <a 
                href="https://www.privacypolicies.com/blog/cookies/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z"/>
                </svg>
                privacypolicies.com/blog/cookies
              </a>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </span>
              Contacto
            </h2>
            <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Si tienes alguna pregunta sobre esta Política de Cookies, puedes contactarnos:
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-apidevs-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <a 
                  href="mailto:info@apidevs.io" 
                  className="text-apidevs-primary hover:text-green-400 font-semibold text-lg transition-colors"
                >
                  info@apidevs.io
                </a>
              </div>
            </div>
          </section>

          {/* Copyright */}
          <footer className="text-center pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              © 2025 APIDEVS LLC. Todos los derechos reservados.
            </p>
          </footer>
        </article>
      </section>
    </main>
  );
}
