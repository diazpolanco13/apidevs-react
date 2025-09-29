import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Obtener avatar_url del perfil
  let avatarUrl = null;
  if (user?.id) {
    const { data: profile } = await (supabase as any)
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    avatarUrl = profile?.avatar_url || null;
  }

  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 mx-auto">
        <Navlinks user={user} avatarUrl={avatarUrl} />
      </div>
    </nav>
  );
}
