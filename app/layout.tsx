import './globals.css';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'Salon Manager',
  description: 'Kapsalon app (MVP)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="container py-3 flex items-center gap-6">
              <Link href="/dashboard" className="font-semibold">Salon Manager</Link>
              <Nav />
            </div>
          </header>
          <main className="container py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
