'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users, Calendar, DollarSign, Scissors, ArrowRight, Star } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    clients: 0,
    professionals: 0,
    services: 0,
    appointmentsToday: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [clientsRes, professionalsRes, servicesRes, appointmentsRes, transactionsRes] = await Promise.all([
        fetch(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/professionals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/services`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_URL}/appointments?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const clientsData = await clientsRes.json();
      const professionalsData = await professionalsRes.json();
      const servicesData = await servicesRes.json();
      const appointmentsData = await appointmentsRes.json();
      const transactionsData = await transactionsRes.json();

      // Calcular receita do mês
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyTransactions = transactionsData.transactions?.filter(
        (t: any) =>
          t.type === 'INCOME' &&
          new Date(t.createdAt) >= firstDayOfMonth
      ) || [];
      const monthlyRevenue = monthlyTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);

      setStats({
        clients: clientsData.clients?.length || 0,
        professionals: professionalsData.professionals?.length || 0,
        services: servicesData.services?.length || 0,
        appointmentsToday: appointmentsData.appointments?.length || 0,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const trends = [
    {
      title: 'Unhas em Gel',
      description: 'Tendência em alta: esmaltação em gel com durabilidade de até 3 semanas',
      icon: '💅',
      gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
      link: '/dashboard/servicos',
    },
    {
      title: 'Micropigmentação',
      description: 'Sobrancelhas perfeitas 24/7 - uma das técnicas mais procuradas',
      icon: '🖋️',
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      link: '/dashboard/servicos',
    },
    {
      title: 'Escova Progressiva',
      description: 'Alisamento duradouro que mantém o cabelo liso por meses',
      icon: '✨',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      link: '/dashboard/servicos',
    },
    {
      title: 'Drenagem Linfática',
      description: 'Massagem terapêutica que reduz inchaço e melhora a circulação',
      icon: '💆',
      gradient: 'from-purple-500 via-violet-500 to-purple-600',
      link: '/dashboard/servicos',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-3 md:p-4 lg:p-6">
      {/* Header Glamouroso */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-4 md:p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-4 mb-2">
            <div className="p-2 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1">Bem-vindo ao BeautyFlow</h1>
              <p className="text-white/90 text-sm md:text-base lg:text-lg">Gerencie seu salão com elegância e sofisticação</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Premium */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs md:text-sm font-medium">Clientes</CardTitle>
            <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {stats.clients}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">Total de clientes cadastrados</p>
            <Link href="/dashboard/clientes">
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 group-hover:text-foreground text-xs md:text-sm">
                Ver todos <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs md:text-sm font-medium">Agendamentos Hoje</CardTitle>
            <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              {stats.appointmentsToday}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">Agendamentos do dia</p>
            <Link href="/dashboard/agenda">
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 text-xs md:text-sm">
                Ver agenda <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs md:text-sm font-medium">Receita do Mês</CardTitle>
            <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex-shrink-0">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              R$ {stats.monthlyRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">Receita total do mês</p>
            <Link href="/dashboard/financeiro">
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 text-xs md:text-sm">
                Ver financeiro <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-500 opacity-10 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs md:text-sm font-medium">Profissionais</CardTitle>
            <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex-shrink-0">
              <Scissors className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              {stats.professionals}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">Total de profissionais</p>
            <Link href="/dashboard/profissionais">
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 group-hover:text-foreground text-xs md:text-sm">
                Ver todos <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Tendências Glamourosos */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-primary flex-shrink-0" />
              <span className="truncate">Tendências do Mercado</span>
            </h2>
            <p className="text-xs md:text-sm lg:text-base text-muted-foreground">Serviços em alta que seus clientes estão procurando</p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {trends.map((trend, idx) => (
            <Card
              key={idx}
              className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10 bg-gradient-to-br from-card to-card/80 cursor-pointer"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${trend.gradient} opacity-10 blur-3xl`}></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className={`text-2xl md:text-3xl lg:text-4xl p-2 md:p-3 rounded-xl bg-gradient-to-br ${trend.gradient} bg-opacity-20`}>
                    {trend.icon}
                  </div>
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                </div>
                <CardTitle className="text-lg md:text-xl mb-2">{trend.title}</CardTitle>
                <CardDescription className="text-xs md:text-sm leading-relaxed">{trend.description}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Link href={trend.link}>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg text-xs md:text-sm lg:text-base">
                    Adicionar Serviço
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2 md:gap-3">
              <Scissors className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
              Serviços
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Total de serviços cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {stats.services}
            </div>
            <Link href="/dashboard/servicos">
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg text-sm md:text-base">
                Gerenciar Serviços
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2 md:gap-3">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
              Ações Rápidas
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            <Link href="/dashboard/agenda">
              <Button className="w-full border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-foreground transition-all text-sm md:text-base" variant="outline">
                <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                + Novo Agendamento
              </Button>
            </Link>
            <Link href="/dashboard/clientes">
              <Button className="w-full border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-foreground transition-all text-sm md:text-base" variant="outline">
                <Users className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                + Novo Cliente
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
