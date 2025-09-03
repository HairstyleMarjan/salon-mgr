'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'classnames';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/appointments', label: 'Agenda' },
  { href: '/customers', label: 'Klanten' },
  { href: '/services', label: 'Diensten' },
  { href: '/pos', label: 'Kassa' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 text-sm">
      {links.map(l => (
        <Link key={l.href} href={l.href} className={clsx('navlink', pathname.startsWith(l.href) && 'font-semibold underline')}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
