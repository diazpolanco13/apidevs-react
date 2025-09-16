import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Descargo de Responsabilidad | APIDevs Trading Platform',
  description: 'Descargo de responsabilidad de APIDevs Trading Platform. Conoce los riesgos asociados con el desarrollo tecnológico y trading.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark relative">
      {/* Background Effects - Extended to Full Page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-yellow-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/8 rounded-full blur-3xl"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Descargo de 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> Responsabilidad</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Conoce los riesgos asociados con el desarrollo tecnológico, trading e implementación de soluciones de software.
          </p>
          <div className="mt-8">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-400 transition-colors"
            >
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer Content */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 z-10">
        <article className="bg-black/30 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 md:p-12">
          
          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">1</span>
              Propósito Educativo e Informativo
            </h2>
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Nuestro sitio web tiene <strong className="text-red-400">fines educativos e informativos únicamente</strong> y no debe considerarse como asesoramiento profesional. El desarrollo e implementación de soluciones tecnológicas conlleva riesgos inherentes.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Los usuarios de nuestro material deben estar preparados para posibles desafíos técnicos en conexión con dichas actividades.
              </p>
            </div>
          </section>

          {/* Risk Disclaimer */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">2</span>
              Descargo de Responsabilidad sobre Riesgos
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  Riesgos del Desarrollo Tecnológico
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  El desarrollo de software, la implementación de APIs y las decisiones tecnológicas conllevan riesgos. Muchos proyectos pueden enfrentar desafíos técnicos, retrasos o resultados inesperados.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Advertencia Importante</p>
                  <p className="text-gray-300 text-sm">
                    El riesgo de pérdida de tiempo, recursos y eficiencia en el desarrollo tecnológico puede ser sustancial. Considera cuidadosamente si tales actividades son adecuadas para ti.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">📊 No es Asesoramiento Técnico Definitivo</h3>
                <p className="text-gray-300 leading-relaxed">
                  Todo el contenido en este sitio no está destinado a ser, y no debe interpretarse como, asesoramiento técnico definitivo o consultoría profesional. Las decisiones tecnológicas implican riesgos y se toman mejor con base en el asesoramiento de profesionales técnicos calificados.
                </p>
              </div>
            </div>
          </section>

          {/* Hypothetical Performance */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">3</span>
              Rendimiento Hipotético y Simulado
            </h2>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">🎯 Limitaciones de Resultados Simulados</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Los resultados de rendimiento hipotéticos o simulados tienen ciertas limitaciones. A diferencia de un registro de rendimiento real, los resultados simulados no representan implementaciones reales.
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Los resultados pueden haber compensado de más o de menos el impacto de ciertos factores del mercado tecnológico, incluyendo la falta de recursos o compatibilidad de sistemas.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-pink-400 mb-3">📈 Diseño Retrospectivo</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Los programas simulados están diseñados con el beneficio de la retrospectiva y se basan en información histórica.
                  </p>
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
                    <p className="text-pink-400 text-xs font-semibold">
                      No se garantiza que cualquier proyecto logrará resultados similares a los mostrados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Disclaimer */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">4</span>
              Descargo sobre Testimonios
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">💬 Testimonios No Representativos</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Los testimonios que aparecen en este sitio web pueden <strong className="text-yellow-400">no ser representativos de otros clientes</strong> y no constituyen una garantía de rendimiento o éxito futuro.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="text-orange-400 font-semibold text-sm mb-2">⚠️ Resultados No Verificados</h4>
                    <p className="text-gray-300 text-xs">
                      Los resultados de desarrollo descritos en los testimonios no están verificados y no tenemos base para creer que sean típicos.
                    </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <h4 className="text-red-400 font-semibold text-sm mb-2">📊 Variabilidad de Resultados</h4>
                    <p className="text-gray-300 text-xs">
                      Los resultados variarán según habilidad, gestión de proyectos, experiencia y otros factores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">🔍 Limitación de Acceso</h3>
                <p className="text-gray-300 leading-relaxed">
                  Como proveedor de herramientas y servicios de desarrollo de APIs, <strong className="text-blue-400">no tenemos acceso a los sistemas internos o métricas de rendimiento privadas</strong> de nuestros clientes. No tenemos razón para creer que nuestros clientes se desempeñen mejor o peor que otros desarrolladores en general.
                </p>
              </div>
            </div>
          </section>

          {/* Not a Professional Advisor */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">5</span>
              APIDEVS No Es Un Asesor Profesional Certificado
            </h2>
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-3">🏢 Registro Regulatorio</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    <strong className="text-indigo-400">APIDEVS LLC no está registrada como asesora tecnológica</strong> con ningún organismo regulador específico. APIDEVS se basa en la provisión de herramientas educativas y recursos informativos.
                  </p>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-purple-400 font-semibold text-sm mb-2">📚 Solo Herramientas Educativas</p>
                    <p className="text-gray-300 text-sm">
                      APIDEVS no ofrece ni proporciona asesoramiento tecnológico personalizado y nada en estos materiales debe interpretarse como asesoramiento profesional definitivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Educational Purposes Only */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">6</span>
              Solo con Fines Informativos y Educativos
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-400/10 border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-green-400 mb-4">📚 Información Impersonal</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  En la medida en que cualquier contenido pueda considerarse "asesoramiento técnico", dicha información es <strong className="text-green-400">impersonal y no está adaptada</strong> a las necesidades tecnológicas de ninguna persona específica.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  La información contenida se proporciona <strong className="text-emerald-400">solo con fines informativos y educativos</strong>.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h4 className="text-cyan-400 font-semibold mb-2">🚫 No es Recomendación</h4>
                  <p className="text-gray-300 text-sm">
                    La información no debe interpretarse como asesoramiento de desarrollo o implementación y no pretende ser una solicitud o recomendación para adoptar ninguna solución tecnológica específica.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-teal-500/10 to-green-500/10 border border-teal-500/30 rounded-xl p-4">
                  <h4 className="text-teal-400 font-semibold mb-2">🎯 Actividades Incidentales</h4>
                  <p className="text-gray-300 text-sm">
                    El contenido proporcionado es únicamente incidental al negocio de APIDEVS LLC en la provisión de herramientas educativas para el desarrollo de APIs.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4">
                <h4 className="text-amber-400 font-semibold mb-2">⚖️ Sin Asesoramiento Profesional</h4>
                <p className="text-gray-300 text-sm">
                  APIDEVS LLC no proporciona ningún asesoramiento legal, fiscal, de planificación empresarial o contable, ni ningún asesoramiento sobre la idoneidad, rentabilidad o conveniencia de cualquier tecnología o estrategia.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">7</span>
              Limitación de Responsabilidad
            </h2>
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-red-400">APIDEVS LLC no será responsable</strong> de ningún daño directo, indirecto, incidental, especial, consecuente o punitivo, incluidos, entre otros, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de:
              </p>
              <div className="grid md:grid-cols-1 gap-3">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">1</span>
                  </span>
                  <p className="text-gray-300 text-sm">Tu uso o incapacidad para usar nuestros servicios</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">2</span>
                  </span>
                  <p className="text-gray-300 text-sm">Cualquier acceso no autorizado o uso de nuestros servidores y/o cualquier información personal almacenada en ellos</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">3</span>
                  </span>
                  <p className="text-gray-300 text-sm">Cualquier interrupción o cese de la transmisión hacia o desde nuestros servicios</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">4</span>
                  </span>
                  <p className="text-gray-300 text-sm">Cualquier error, virus, troyano o similar que pueda ser transmitido a o a través de nuestros servicios</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">5</span>
                  </span>
                  <p className="text-gray-300 text-sm">Cualquier error u omisión en cualquier contenido o por cualquier pérdida o daño incurrido como resultado del uso de cualquier contenido</p>
                </div>
              </div>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">8</span>
              Indemnización
            </h2>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-orange-400 mb-3">🛡️ Compromiso del Usuario</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Aceptas <strong className="text-orange-400">defender, indemnizar y mantener indemne</strong> a APIDEVS LLC, sus afiliados y sus respectivos funcionarios, directores, empleados y agentes de y contra cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y gastos (incluidos honorarios de abogados) que surjan de tu uso y acceso al servicio, o tu violación de estos Términos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Modifications */}
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">9</span>
              Modificaciones
            </h2>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed">
                Nos reservamos el derecho, a nuestra sola discreción, de <strong className="text-cyan-400">modificar o reemplazar estos términos en cualquier momento</strong>. Si una revisión es material, proporcionaremos al menos 30 días de aviso antes de que los nuevos términos entren en vigor.
              </p>
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
                Si tienes alguna pregunta sobre este Descargo de Responsabilidad, puedes contactarnos:
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
