'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro ao fazer login",
          description: responseData.error || 'Email ou senha inválidos',
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
          variant: "success",
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl transform rotate-6"></div>
        <Card className="relative glass-card border-2 border-pink-600/30 shadow-2xl">
          <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              <span className="text-primary">Bem-vindo</span>{' '}
              <span className="text-accent">de volta!</span>
            </CardTitle>
            <CardDescription className="text-sm mt-2">
              Faça login para acessar seu salão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 bg-background/80 border-2 border-input focus:border-primary text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 bg-background/80 border-2 border-input focus:border-primary text-sm"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-10 bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Cadastre-se grátis
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

