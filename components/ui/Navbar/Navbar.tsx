import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Obtener avatar_url, user_status y unread_notifications del perfil
  let avatarUrl = null;
  let userStatus = 'online';
  let unreadNotifications = 0;
  
  if (user?.id) {
    const { data: profile } = await (supabase as any)
      .from('users')
      .select('avatar_url, user_status, unread_notifications')
      .eq('id', user.id)
      .single();
    
    avatarUrl = profile?.avatar_url || null;
    userStatus = profile?.user_status || 'online';
    unreadNotifications = profile?.unread_notifications || 0;
  }

  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 mx-auto">
        <Navlinks 
          user={user} 
          avatarUrl={avatarUrl} 
          userStatus={userStatus}
          unreadNotifications={unreadNotifications}
        />
      </div>
    </nav>
  );
}
