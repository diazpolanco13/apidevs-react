import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | APIDevs Trading Platform',
  description: 'Términos y condiciones de uso de APIDevs Trading Platform. Conoce nuestras políticas de servicio, reembolsos y responsabilidades.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-apidevs-primary/5 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-apidevs-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Términos y 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-apidevs-primary to-green-400"> Condiciones</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Conoce nuestros términos de servicio, políticas de reembolso y condiciones de uso de la plataforma APIDevs Trading.
          </p>
          <div className="mt-8">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-apidevs-primary text-black font-semibold rounded-2xl hover:bg-green-400 transition-colors"
            >
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <article className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-3xl p-8 md:p-12">
          
          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">1</span>
              Resumen General
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                Este sitio web es operado por <strong className="text-apidevs-primary">apidevs.io</strong> (APIDEVS LLC). 
                A lo largo del sitio, los términos "nosotros", "nos" y "nuestro" se refieren a apidevs.io.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                apidevs.io ofrece este sitio web, incluyendo toda la información, herramientas y servicios disponibles, 
                condicionado a tu aceptación de todos los términos, condiciones y políticas aquí establecidos.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Al visitar nuestro sitio y/o comprar cualquiera de nuestras herramientas, participas en nuestro "Servicio" 
                y aceptas vincularte por los siguientes términos y condiciones. Si no estás de acuerdo con todos los términos, 
                no podrás acceder al sitio web ni utilizar ningún servicio.
              </p>
            </div>
          </section>

          {/* Section 1 - Plans and Payments */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">2</span>
              Planes, Pagos y Servicio
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-apidevs-primary mb-3">Suscripciones Regulares</h3>
                <p className="text-gray-300 leading-relaxed">
                  Ofrecemos planes de suscripción periódicos. Las condiciones específicas, precios y ciclo de facturación 
                  se detallarán en el momento de la compra.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Plan de Acceso Vitalicio</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Ofrecemos un plan de "Acceso Vitalicio". Este plan concede al usuario acceso a los servicios especificados 
                  en el momento de la compra mientras el Servicio esté operativo.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Condición Esencial de Servicio</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Nuestro Servicio depende íntegramente de la plataforma TradingView.com para su funcionamiento. 
                    Por lo tanto, el "Acceso Vitalicio" se ofrece y se mantendrá activo siempre y cuando la empresa 
                    TradingView.com siga existiendo y permita la integración de nuestras herramientas en su plataforma 
                    en condiciones que nosotros consideremos viables.
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-4">
                  <h4 className="text-lg font-semibold text-red-400 mb-2">Terminación del Acceso Vitalicio</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Si TradingView.com cesa sus operaciones, cambia sus políticas de manera que nos impida ofrecer nuestro Servicio, 
                    o deja de existir por cualquier motivo, el acuerdo de "Acceso Vitalicio" se considerará concluido. 
                    Esta terminación no dará derecho a reembolsos, créditos o compensaciones de ningún tipo.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 - Refund Policy */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">3</span>
              Política de Reembolsos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-400/10 border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-green-400 mb-3">✅ Suscripciones Regulares</h3>
                <p className="text-gray-300 leading-relaxed">
                  Ofrecemos reembolsos para el primer pago inicial de una suscripción dentro de un período de 
                  <strong className="text-green-400"> 30 días</strong> si no estás satisfecho con nuestro Servicio. 
                  Para solicitar un reembolso, contáctanos en <strong className="text-apidevs-primary">info@apidevs.io</strong>.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-3">❌ Plan de Acceso Vitalicio</h3>
                <p className="text-gray-300 leading-relaxed">
                  Debido a su naturaleza, la compra del plan de Acceso Vitalicio es final. 
                  <strong className="text-red-400"> No se ofrecen reembolsos bajo ninguna circunstancia</strong> 
                  para el plan de Acceso Vitalicio, una vez procesado el pago.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">4</span>
              Derechos de Propiedad Intelectual
            </h2>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed">
                Los Servicios y todo su contenido, características y funcionalidad son propiedad de 
                <strong className="text-purple-400"> apidevs.io</strong>, sus licenciantes u otros proveedores de dicho material 
                y están protegidos por las leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual 
                de Estados Unidos e internacionales. No debes reproducir, distribuir, modificar, republicar o transmitir ningún 
                material de nuestros Servicios sin nuestro permiso expreso por escrito.
              </p>
            </div>
          </section>

          {/* Section 4 - Trademarks */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">5</span>
              Marcas Registradas
            </h2>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed">
                El nombre <strong className="text-orange-400">apidevs.io</strong>, nuestro logotipo y todos los nombres, 
                logos, y eslóganes relacionados son marcas comerciales de apidevs.io. No debes usar dichas marcas sin 
                nuestro permiso previo por escrito.
              </p>
            </div>
          </section>

          {/* Section 5 - Disclaimers */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">6</span>
              Descargos de Responsabilidad
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-3">⚠️ Descargo de Riesgo</h3>
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-red-400">El trading es arriesgado y la mayoría de los traders pierden dinero.</strong> 
                  Todo el contenido debe ser considerado hipotético y no debe interpretarse como asesoramiento financiero. 
                  Las decisiones de comprar, vender o mantener valores implican un riesgo y se toman mejor con el asesoramiento 
                  de profesionales financieros cualificados.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">📊 No somos Asesores de Inversión</h3>
                <p className="text-gray-300 leading-relaxed">
                  apidevs.io no está registrado como asesor de inversiones. La información proporcionada es impersonal y 
                  tiene fines meramente informativos y educativos. No es una solicitud o recomendación para comprar, 
                  vender o mantener ninguna posición.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-green-400 mb-3">📈 Divulgación sobre TradingView</h3>
                <p className="text-gray-300 leading-relaxed">
                  Los gráficos utilizados en este sitio son de TradingView, plataforma sobre la cual se construyen nuestras herramientas. 
                  TradingView® es una marca registrada de TradingView, Inc. TradingView no tiene afiliación con el propietario, 
                  desarrollador o proveedor de los Servicios aquí descritos.
                </p>
              </div>
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
              Información de Contacto
            </h2>
            <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed">
                Las preguntas sobre los Términos de Servicio deben enviarse a:
              </p>
              <div className="mt-4 flex items-center space-x-3">
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

          {/* Last Updated */}
          <footer className="text-center pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Última actualización: Septiembre 2025
            </p>
          </footer>
        </article>
      </section>
    </main>
  );
}