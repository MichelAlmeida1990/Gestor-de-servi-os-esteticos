'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  Scissors, 
  DollarSign, 
  Sparkles, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
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

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Inteligente',
      description: 'Gerencie todos os agendamentos em uma interface visual e intuitiva. Veja sua agenda do dia, semana ou mês com apenas alguns cliques.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastre e gerencie todos os seus clientes. Histórico completo, preferências, aniversários e muito mais em um só lugar.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Scissors,
      title: 'Controle de Serviços',
      description: 'Organize seus serviços por categoria. Adicione serviços pré-definidos com um clique ou crie serviços personalizados.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: DollarSign,
      title: 'Financeiro Completo',
      description: 'Controle total sobre receitas e despesas. Acompanhe ganhos por profissional, relatórios detalhados e muito mais.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Relatórios e Análises',
      description: 'Visualize o desempenho do seu salão com gráficos e estatísticas. Identifique tendências e oportunidades de crescimento.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Seus dados protegidos com criptografia. Backup automático e sistema 100% seguro para você e seus clientes.',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  const benefits = [
    'Reduza faltas em até 40% com lembretes automáticos',
    'Aumente sua receita com melhor organização',
    'Economize tempo com automações inteligentes',
    'Acompanhe o desempenho de cada profissional',
    'Tenha controle total do seu negócio na palma da mão'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="glass-pink border-b border-pink-200/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-primary">Beauty</span>
            <span className="text-accent">Flow</span>
          </h1>
                <p className="text-xs text-muted-foreground">Gestão Completa para Salões</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
            <Link href="/register">
                <Button variant="outline" className="border-2 border-primary/30 hover:bg-primary/10">
                  Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/login">
                <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                  Entrar
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Sistema #1 para Salões de Beleza</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Gerencie seu{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Salão de Beleza
                </span>
                {' '}com Inteligência
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                A solução completa para agendamentos, clientes, profissionais e financeiro. 
                Tudo que você precisa para fazer seu salão crescer.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all">
                  Começar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-primary/30 hover:bg-primary/10">
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Gratuito para começar</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">Disponível sempre</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">5min</div>
                <div className="text-sm text-muted-foreground">Para configurar</div>
              </div>
            </div>
          </div>

          {/* Right: Login Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl transform rotate-6"></div>
            <Card className="relative glass-card border-2 border-pink-600/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2">
                    <span className="text-primary">Bem-vindo</span> de volta!
                  </h2>
                  <p className="text-muted-foreground">Faça login para acessar seu salão</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-background/80 border-2 border-input focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-semibold">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-background/80 border-2 border-input focus:border-primary"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem conta?{' '}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                      Cadastre-se grátis
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Tudo que você precisa em{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              um só lugar
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Funcionalidades poderosas desenvolvidas especificamente para salões de beleza e manicure
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="glass-card border-2 border-pink-600/30 hover:border-pink-600/60 transition-all hover:shadow-xl hover:scale-105 group"
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-card border-2 border-pink-600/30 rounded-3xl p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Por que escolher o{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  BeautyFlow?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Mais de 1000 salões já confiam no BeautyFlow para gerenciar seus negócios. 
                Veja os resultados que você pode alcançar:
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-gradient-to-br from-primary to-secondary mt-1">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <div className="relative glass-card border-2 border-pink-600/30 rounded-3xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Zap className="w-8 h-8 text-primary" />
                      <div>
                        <div className="font-bold text-lg">Setup Rápido</div>
                        <div className="text-sm text-muted-foreground">Configure em minutos</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-secondary" />
                      <div>
                        <div className="font-bold text-lg">100% Seguro</div>
                        <div className="text-sm text-muted-foreground">Dados protegidos</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-accent" />
                      <div>
                        <div className="font-bold text-lg">Interface Moderna</div>
                        <div className="text-sm text-muted-foreground">Fácil de usar</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-12 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
              Pronto para transformar seu salão?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Comece grátis hoje mesmo. Sem cartão de crédito. Sem compromisso.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl h-14 px-8 text-lg">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                  Já tenho conta
              </Button>
            </Link>
          </div>
            <p className="mt-6 text-sm text-white/80">
              ✨ Sem custos ocultos • ✨ Suporte 24/7 • ✨ Atualizações gratuitas
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-200/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold">
                  <span className="text-primary">Beauty</span>
                  <span className="text-accent">Flow</span>
                </div>
                <div className="text-xs text-muted-foreground">© 2024 Todos os direitos reservados</div>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Sobre</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contato</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-primary transition-colors">Termos</Link>
            </div>
        </div>
      </div>
      </footer>
    </div>
  );
}
