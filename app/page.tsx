import { redirect } from 'next/navigation';
import { createServer } from '@/lib/supabase';

export default async function Home() {
  const supabase = createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  redirect('/dashboard');
}
