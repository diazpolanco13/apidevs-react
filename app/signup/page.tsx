import { redirect } from 'next/navigation';

export default async function SignUp() {
  // Redirigir a la página de signup dentro de signin
  return redirect('/signin/signup');
}

