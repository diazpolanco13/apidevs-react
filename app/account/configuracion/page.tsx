import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import ConfiguracionClient from './ConfiguracionClient';

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return <ConfiguracionClient user={user} />;
}
