'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    establishmentName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Preparar dados: remover campos vazios e enviar apenas o necessário
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        establishmentName: formData.establishmentName,
        ...(formData.phone && formData.phone.trim() !== '' ? { phone: formData.phone } : {}),
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Mostrar erro detalhado do backend
        const errorMessage = responseData.error || responseData.message || `Erro ${response.status}: ${response.statusText}`;
        const details = responseData.details ? `\n\nDetalhes: ${JSON.stringify(responseData.details, null, 2)}` : '';
        alert(`${errorMessage}${details}`);
        setLoading(false);
        return;
      }

      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
        router.push('/dashboard');
      } else {
        alert('Token não recebido do servidor');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      alert(error instanceof Error ? `Erro: ${error.message}` : 'Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            <span className="text-primary">Beauty</span>
            <span className="text-accent">Flow</span>
          </CardTitle>
          <CardDescription>Crie sua conta e comece a gerenciar seu salão</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="establishmentName">Nome do Salão</Label>
              <Input
                id="establishmentName"
                type="text"
                placeholder="Salão da Maria"
                value={formData.establishmentName}
                onChange={(e) => setFormData({ ...formData, establishmentName: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

