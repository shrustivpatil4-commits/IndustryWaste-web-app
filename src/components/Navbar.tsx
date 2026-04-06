"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from './ui/button';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/list-waste', label: 'List Waste' },
    { href: '/scan', label: '📸 Scan' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-teal-accent/20 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2 text-teal-accent transition-transform hover:scale-105">
          <Leaf className="h-6 w-6" />
          <span className="font-sans font-bold text-xl tracking-tight">WasteExchange</span>
        </Link>
        <div className="flex gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-teal-accent font-sans",
                pathname === link.href ? "text-teal-accent" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
