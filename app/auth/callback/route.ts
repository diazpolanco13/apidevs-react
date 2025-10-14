import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import { syncLegacyUserData } from '@/utils/supabase/loyalty';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }

    // Auto-detect legacy users and sync their data
    let isLegacyUser = false;
    if (data.user && data.user.email) {
      try {
        isLegacyUser = await syncLegacyUserData(
          supabase,
          data.user.id,
          data.user.email
        );
        
        if (isLegacyUser) {
          console.log(`✅ Legacy user detected and synced: ${data.user.email}`);
        }
      } catch (error) {
        // No bloquear el flujo si falla la sincronización
        console.error('Error syncing legacy user:', error);
      }
    }

    // Check if user needs onboarding
    if (data.user) {
      const { completed } = await checkOnboardingStatus(data.user.id);
      
      if (!completed) {
        return NextResponse.redirect(
          getStatusRedirect(
            `${requestUrl.origin}/onboarding`,
            'Welcome!',
            'Complete your profile to get started.'
          )
        );
      }
    }
    
    // If legacy user, redirect to dashboard with welcome parameter
    if (isLegacyUser) {
      return NextResponse.redirect(
        `${requestUrl.origin}/account?welcome=legacy`
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/account`,
      'Success!',
      'You are now signed in.'
    )
  );
}
