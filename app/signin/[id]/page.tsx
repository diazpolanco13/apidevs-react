import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/auth-helpers/settings';
import Card from '@/components/ui/Card';
import PasswordSignIn from '@/components/ui/AuthForms/PasswordSignIn';
import EmailSignIn from '@/components/ui/AuthForms/EmailSignIn';
import Separator from '@/components/ui/AuthForms/Separator';
import OauthSignIn from '@/components/ui/AuthForms/OauthSignIn';
import ForgotPassword from '@/components/ui/AuthForms/ForgotPassword';
import UpdatePassword from '@/components/ui/AuthForms/UpdatePassword';
import SignUp from '@/components/ui/AuthForms/Signup';

export default async function SignIn({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ disable_button?: boolean; plan?: string; error?: string; error_description?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();
  
  // Get selected plan from URL params
  const selectedPlan = resolvedSearchParams.plan;
  
  // Plan information
  const getPlanInfo = (plan: string | undefined) => {
    switch (plan) {
      case 'free':
        return {
          name: 'Plan FREE',
          price: 'Gratis',
          color: 'text-green-400',
          benefits: ['5 Indicadores clásicos', 'Telegram Community', 'Tutoriales básicos']
        };
      case 'pro':
        return {
          name: 'Plan PRO',
          price: 'Desde $39/mes',
          color: 'text-blue-400',
          benefits: ['18 Indicadores avanzados', 'Scanners únicos', 'Telegram VIP', 'Mentorías semanales']
        };
      case 'lifetime':
        return {
          name: 'Plan LIFETIME',
          price: '$999 único',
          color: 'text-purple-400',
          benefits: ['Todo lo anterior + Premium', 'Telegram personal', 'Productos personalizados', 'Acceso de por vida']
        };
      default:
        return null;
    }
  };
  
  const planInfo = getPlanInfo(selectedPlan);

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Assign url id to 'viewProp' if it's a valid string and ViewTypes includes it
  if (typeof id === 'string' && viewTypes.includes(id)) {
    viewProp = id;
  } else {
    const preferredSignInView =
      (await cookies()).get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect('/');
  } else if (!user && viewProp === 'update_password') {
    return redirect('/signin');
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-apidevs-primary rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-32 left-16 w-3 h-3 bg-apidevs-primary/50 rounded-full animate-bounce"></div>
      
      <div className="relative z-10 flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-apidevs-primary to-white mb-4">
              {viewProp === 'signup' 
                ? 'Únete a la Comunidad' 
                : '¡Hola de nuevo!'
              }
            </h1>
            <p className="text-gray-300 text-lg md:text-xl">
              {viewProp === 'signup' 
                ? 'Más de 6,500 traders exitosos confían en nosotros' 
                : 'Accede a tus herramientas de trading profesional'
              }
            </p>
            
            {/* Plan Selected Badge */}
            {planInfo && viewProp === 'signup' && (
              <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-apidevs-primary/20 to-green-400/20 rounded-full border border-apidevs-primary/30">
                <span className="text-sm">
                  <span className="text-gray-300">Plan seleccionado: </span>
                  <span className={`font-semibold ${planInfo.color}`}>
                    {planInfo.name}
                  </span>
                  <span className="text-gray-400 ml-2">({planInfo.price})</span>
                </span>
              </div>
            )}
          </div>

          {/* Auth Card */}
          <div className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                {viewProp === 'forgot_password'
                  ? 'Restablecer Contraseña'
                  : viewProp === 'update_password'
                    ? 'Actualizar Contraseña'
                    : viewProp === 'signup'
                      ? 'Crear Cuenta'
                      : 'Iniciar Sesión'
                }
              </h2>
              <p className="text-gray-400 text-sm">
                {viewProp === 'signup' 
                  ? 'Accede a indicadores profesionales y únete a nuestra comunidad VIP'
                  : 'Ingresa tus credenciales para acceder a tu cuenta'
                }
              </p>
            </div>
            {viewProp === 'password_signin' && (
              <PasswordSignIn
                allowEmail={allowEmail}
                redirectMethod={redirectMethod}
                error={resolvedSearchParams.error_description || resolvedSearchParams.error}
              />
            )}
            {viewProp === 'email_signin' && (
              <EmailSignIn
                allowPassword={allowPassword}
                redirectMethod={redirectMethod}
                disableButton={resolvedSearchParams.disable_button}
              />
            )}
            {viewProp === 'forgot_password' && (
              <ForgotPassword
                allowEmail={allowEmail}
                redirectMethod={redirectMethod}
                disableButton={resolvedSearchParams.disable_button}
              />
            )}
            {viewProp === 'update_password' && (
              <UpdatePassword redirectMethod={redirectMethod} />
            )}
            {viewProp === 'signup' && (
              <SignUp 
                allowEmail={allowEmail} 
                redirectMethod={redirectMethod} 
                selectedPlan={selectedPlan}
                planInfo={planInfo}
              />
            )}
            {viewProp !== 'update_password' &&
              viewProp !== 'signup' &&
              allowOauth && (
                <>
                  <Separator text="O continúa con" />
                  <OauthSignIn />
                </>
              )}
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© 2024 APIDevs Trading. Todos los derechos reservados.</p>
            <p className="mt-2">
              ¿Necesitas ayuda? {' '}
              <a href="mailto:support@apidevs.io" className="text-apidevs-primary hover:text-green-400 transition-colors">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
