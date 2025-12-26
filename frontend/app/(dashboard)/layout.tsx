'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/api';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Buscar dados do usuário
    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/agenda', label: 'Agenda', icon: '📅' },
    { href: '/dashboard/clientes', label: 'Clientes', icon: '👥' },
    { href: '/dashboard/profissionais', label: 'Profissionais', icon: '👨‍💼' },
    { href: '/dashboard/servicos', label: 'Serviços', icon: '✂️' },
    { href: '/dashboard/financeiro', label: 'Financeiro', icon: '💰' },
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="flex relative">
        {/* Overlay para mobile quando sidebar está aberto */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar com Glassmorphism Rosa Claro */}
        <aside
          className={`
            fixed md:static
            top-0 left-0
            w-64 min-h-screen
            p-4 glass-pink
            z-50 md:z-auto
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Botão fechar no mobile */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold">
              💅 <span className="text-primary">Beauty</span>
              <span className="text-accent">Flow</span>
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all backdrop-blur-sm text-sm md:text-base ${
                  pathname === item.href
                    ? 'bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 backdrop-blur-md'
                    : 'hover:bg-pink-600/30 hover:backdrop-blur-md text-foreground'
                }`}
              >
                <span className="text-lg md:text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full md:w-auto min-w-0">
          {/* Header com Glassmorphism */}
          <header className="glass-pink border-b border-pink-600/30 p-3 md:p-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Menu Hambúrguer para Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden flex-shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold truncate">
                  {user.establishments?.[0]?.name || 'Meu Salão'}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex-shrink-0 text-xs md:text-sm px-3 md:px-4">
              <span className="hidden sm:inline">Sair</span>
              <span className="sm:hidden">Sair</span>
            </Button>
          </header>

          {/* Page Content */}
          <div className="p-3 md:p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

