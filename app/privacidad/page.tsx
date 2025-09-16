import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad | APIDevs Trading Platform',
  description: 'Política de privacidad de APIDevs Trading Platform. Conoce cómo protegemos y procesamos tu información personal.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark relative">
      {/* Background Effects - Extended to Full Page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-apidevs-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Política de 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Privacidad</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Conoce cómo APIDevs Trading Platform protege, recopila y procesa tu información personal de acuerdo con las leyes internacionales de privacidad.
          </p>
          <div className="mt-8">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-400 transition-colors"
            >
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 z-10">
        <article className="bg-black/30 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 md:p-12">
          
          {/* Section 1 - General Information */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">1</span>
              Información General
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-blue-400">APIDevs LLC (APIDevs)</strong> respeta la privacidad de la información que te identifica o es identificable a ti (Información Personal). Queremos que entiendas cómo APIDevs procesa la Información Personal, y cómo puedes enviar solicitudes de derechos de privacidad concernientes a tu Información Personal.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Nuestro procesamiento de Información Personal se rige por las diversas leyes de Estados Unidos, Canadá, Unión Europea y otros países que rigen el procesamiento de Información Personal (Leyes de Privacidad de Datos) así como por esta Política de Privacidad.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Protección de Menores</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  No tenemos la intención de, y no procesamos conscientemente, Información Personal sobre individuos menores de edad. Los menores no deben proporcionar ninguna Información Personal a nosotros.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 - Data Privacy Officer */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">2</span>
              Oficial de Privacidad de Datos
            </h2>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Para preguntas sobre el procesamiento de tu Información Personal por parte de APIDevs o esta Política, contacta a nuestro Oficial de Privacidad de Datos:
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-purple-400 font-semibold">info@apidevs.io</p>
                  <p className="text-gray-400 text-sm">APIDevs LLC</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 - Information Collection */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">3</span>
              Recopilación de Información Personal
            </h2>
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                APIDevs proporciona indicadores técnicos de trading (gratuitos y premium) que pueden conectarse a aplicaciones de inversión financiera como TradingView. En el curso de proporcionar los Productos, recopilamos la siguiente Información Personal:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-apidevs-primary mb-3">🆔 Identificadores</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Nombre y apellido</li>
                    <li>• Dirección de correo electrónico</li>
                    <li>• Dirección de facturación</li>
                    <li>• Número de teléfono</li>
                    <li>• <strong className="text-apidevs-primary">Usuario de TradingView</strong> (crítico)</li>
                    <li>• Ubicación geográfica</li>
                    <li>• Dirección IP</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border border-blue-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">💳 Información Financiera</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Información de tarjeta de crédito/débito</li>
                    <li>• Historial de transacciones</li>
                  </ul>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mt-3">
                    <p className="text-green-400 text-xs font-semibold">✅ Importante: No almacenamos información de pago completa. Usamos Stripe como procesador seguro.</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-400/10 border border-purple-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">📊 Información de Uso</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Datos de navegación del sitio web</li>
                    <li>• Preferencias de usuario</li>
                    <li>• Historial de uso de indicadores</li>
                    <li>• Métricas de rendimiento de trading (voluntarias)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 - When We Collect Information */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">4</span>
              Cuándo Recopilamos Información
            </h2>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Dependiendo de cómo interactúes con nosotros, podemos recopilar Información Personal cuando:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-orange-400 mr-2">•</span> Visitas el Sitio</li>
                  <li className="flex items-center"><span className="text-orange-400 mr-2">•</span> Te suscribes creando una cuenta</li>
                  <li className="flex items-center"><span className="text-orange-400 mr-2">•</span> Completas el proceso de onboarding obligatorio</li>
                </ul>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-orange-400 mr-2">•</span> Te comunicas con nosotros vía email</li>
                  <li className="flex items-center"><span className="text-orange-400 mr-2">•</span> Interactúas de otra manera con nosotros</li>
                  <li className="flex items-center"><span className="text-orange-400 mr-2">•</span> Utilizas nuestros indicadores en TradingView</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 - How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">5</span>
              Cómo Usamos tu Información Personal
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-400/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-green-400 font-semibold mb-2">🚀 Provisión del servicio</h4>
                  <p className="text-gray-300 text-sm">Proporcionar, desarrollar, mantener y mejorar los Productos y el Sitio</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">📞 Comunicación</h4>
                  <p className="text-gray-300 text-sm">Comunicarnos contigo sobre los Productos, actualizaciones e indicadores</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-400/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">🛠️ Soporte técnico</h4>
                  <p className="text-gray-300 text-sm">Proporcionar soporte incluyendo responder a solicitudes, preguntas y comentarios</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-400/10 border border-yellow-500/30 rounded-xl p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">💳 Procesamiento de transacciones</h4>
                  <p className="text-gray-300 text-sm">Procesar y completar transacciones, enviar confirmaciones y facturas</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-500/10 to-rose-400/10 border border-pink-500/30 rounded-xl p-4">
                  <h4 className="text-pink-400 font-semibold mb-2">🎯 Personalización</h4>
                  <p className="text-gray-300 text-sm">Personalizar tu experiencia con el Sitio y los indicadores</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-500/10 to-blue-400/10 border border-indigo-500/30 rounded-xl p-4">
                  <h4 className="text-indigo-400 font-semibold mb-2">📧 Marketing</h4>
                  <p className="text-gray-300 text-sm">Enviarte comunicaciones de marketing sobre características y ofertas</p>
                </div>
                <div className="bg-gradient-to-r from-red-500/10 to-pink-400/10 border border-red-500/30 rounded-xl p-4">
                  <h4 className="text-red-400 font-semibold mb-2">🔒 Seguridad</h4>
                  <p className="text-gray-300 text-sm">Mantener la seguridad, protección e integridad de nuestros Productos</p>
                </div>
                <div className="bg-gradient-to-r from-teal-500/10 to-cyan-400/10 border border-teal-500/30 rounded-xl p-4">
                  <h4 className="text-teal-400 font-semibold mb-2">📊 Gestión de acceso</h4>
                  <p className="text-gray-300 text-sm">Proporcionar y gestionar acceso a indicadores específicos de TradingView</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 - Privacy Rights */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">6</span>
              Derechos de Privacidad
            </h2>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Dependiendo de la Información Personal que APIDevs tenga sobre ti, puedes tener los siguientes derechos de privacidad:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Ser informado</strong> sobre cómo se procesa tu información</span></li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Acceder o recibir</strong> una copia de tu información</span></li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Rectificar o actualizar</strong> información inexacta</span></li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Borrado o eliminación</strong> de ciertas categorías</span></li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Objetar y optar por no participar</strong> en el procesamiento</span></li>
                </ul>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Limitar el procesamiento</strong> de tu información</span></li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Portabilidad</strong> en formato comúnmente usado</span></li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>Retirada de consentimiento</strong> al procesamiento</span></li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2 mt-1">✓</span> <span><strong>No discriminación</strong> por ejercer tus derechos</span></li>
                </ul>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-4">
                <p className="text-blue-400 font-semibold mb-2">📧 Para ejercer estos derechos:</p>
                <p className="text-gray-300 text-sm">Contacta a <strong>info@apidevs.io</strong>. Confirmaremos recepción en 10 días y responderemos en 30 días.</p>
              </div>
            </div>
          </section>

          {/* Section 7 - Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">7</span>
              Seguridad de Datos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-3">🔒 Medidas Técnicas</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Encriptación de datos en tránsito y en reposo</li>
                  <li>• Acceso restringido a Información Personal</li>
                  <li>• Monitoreo regular de sistemas de seguridad</li>
                  <li>• Cumplimiento con estándares de la industria</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">🛡️ Protecciones Organizacionales</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Políticas de acceso y control</li>
                  <li>• Capacitación en seguridad</li>
                  <li>• Auditorías regulares</li>
                  <li>• Respuesta a incidentes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8 - Cookies and Tracking */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">8</span>
              Cookies y Tecnologías de Seguimiento
            </h2>
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-yellow-400 mr-2">🔐</span> Mantener tu sesión autenticada</li>
                  <li className="flex items-center"><span className="text-yellow-400 mr-2">⚙️</span> Recordar tus preferencias</li>
                </ul>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-yellow-400 mr-2">📊</span> Analizar el uso del sitio</li>
                  <li className="flex items-center"><span className="text-yellow-400 mr-2">💳</span> Procesar pagos seguros vía Stripe</li>
                </ul>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mt-4">
                <p className="text-orange-400 text-sm">
                  <strong>Control de Cookies:</strong> Puedes controlar las cookies a través de la configuración de tu navegador. Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 - Legal Compliance */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">9</span>
              Cumplimiento Legal
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-indigo-400 mb-3">🇺🇸 CCPA (California)</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Si eres residente de California, tienes derechos adicionales bajo la Ley de Privacidad del Consumidor de California (CCPA), incluyendo el derecho a conocer qué información personal recopilamos, usamos, divulgamos y vendemos.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">🇪🇺 GDPR (Unión Europea)</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Si estás en la Unión Europea, tus datos están protegidos bajo el Reglamento General de Protección de Datos (GDPR). Tienes derechos específicos incluyendo el derecho al olvido y la portabilidad de datos.
                </p>
              </div>
            </div>
          </section>

          {/* Trading Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-400 rounded-lg mr-3 flex items-center justify-center text-black font-bold text-lg">⚠️</span>
              Aviso Importante sobre Trading
            </h2>
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-2xl p-6">
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-red-400">El trading es arriesgado y muchos perderán dinero</strong> en conexión con actividades de trading. Todo el contenido en este sitio no pretende, y no debe ser, interpretado como asesoramiento financiero.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Como proveedor de herramientas de análisis técnico para plataformas de gráficos, no tenemos acceso a las cuentas de trading personales o estados de cuenta de corretaje de nuestros clientes.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 text-sm">
                    <strong>Divulgación TradingView:</strong> Los gráficos utilizados son de TradingView®. TradingView® es una marca registrada de TradingView, Inc. TradingView® no tiene afiliación con APIDevs.
                  </p>
                </div>
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
              Preguntas o Inquietudes
            </h2>
            <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Para preguntas o inquietudes sobre esta Política de Privacidad, contacta a nuestro Oficial de Privacidad de Datos:
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-apidevs-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <div>
                  <a 
                    href="mailto:info@apidevs.io" 
                    className="text-apidevs-primary hover:text-green-400 font-semibold text-lg transition-colors"
                  >
                    info@apidevs.io
                  </a>
                  <p className="text-gray-400 text-sm">APIDevs LLC</p>
                </div>
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
