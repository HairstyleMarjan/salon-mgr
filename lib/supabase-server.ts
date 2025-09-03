import { createServerClient as supaCreateServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const cookieStore = cookies();
  return supaCreateServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: any) =>
          cookieStore.set({ name, value: '', ...options }),
      },
    }
  );
};
