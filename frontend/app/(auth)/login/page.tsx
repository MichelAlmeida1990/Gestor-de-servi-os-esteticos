'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a landing page que já tem o formulário de login integrado
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      // Usar window.location para garantir que o hash seja processado corretamente
      window.location.href = '/#login';
    }
  }, [router]);

  // Mostrar loading durante o redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}
