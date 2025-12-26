'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Clock, User, Sparkles, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, CheckCircle2, BadgeDollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
    category: string;
  };
  professional: {
    id: string;
    name: string;
  } | null;
  notes: string | null;
  transaction?: {
    id: string;
  } | null;
}

interface Client {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  name: string;
  isActive?: boolean;
}

const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8h às 21h

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/20' },
    CONFIRMED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', glow: 'shadow-green-500/20' },
    IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-blue-500/20' },
    COMPLETED: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50', glow: 'shadow-gray-500/20' },
    CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50', glow: 'shadow-red-500/20' },
    NO_SHOW: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', glow: 'shadow-orange-500/20' },
  };
  return colors[status] || colors.PENDING;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Falta',
  };
  return labels[status] || status;
};

const getCategoryGradient = (category: string) => {
  const gradients: Record<string, string> = {
    'Cabelo': 'from-blue-500 via-cyan-500 to-teal-500',
    'Manicure': 'from-pink-500 via-rose-500 to-fuchsia-500',
    'Pedicure': 'from-purple-500 via-violet-500 to-purple-600',
    'Estética': 'from-amber-500 via-orange-500 to-yellow-500',
    'Depilação': 'from-violet-500 via-purple-500 to-indigo-500',
    'Maquiagem': 'from-rose-500 via-pink-500 to-red-500',
  };
  return gradients[category] || 'from-gray-500 via-gray-600 to-gray-700';
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'Cabelo': '✂️',
    'Manicure': '💅',
    'Pedicure': '👣',
    'Estética': '✨',
    'Depilação': '🪶',
    'Maquiagem': '💄',
  };
  return icons[category] || '✨';
};

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'day' | 'month'>('day');
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [monthCalendarOpen, setMonthCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    professionalId: '',
    date: '',
    startTime: '',
    notes: '',
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
  });

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedProfessionalId]);

  useEffect(() => {
    if (activeTab === 'month' || monthCalendarOpen) {
      loadMonthData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, selectedProfessionalId, monthCalendarOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Normalizar a data selecionada para o início do dia no timezone local
      // Criar data no timezone local explicitamente
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Criar início do dia no timezone local (00:00:00)
      const startDateLocal = new Date(year, month, day, 0, 0, 0, 0);
      // Criar fim do dia no timezone local (23:59:59)
      const endDateLocal = new Date(year, month, day, 23, 59, 59, 999);

      // Converter para UTC para enviar ao backend
      const startDateUTC = startDateLocal.toISOString();
      const endDateUTC = endDateLocal.toISOString();

      let appointmentsUrl = `${API_URL}/appointments?startDate=${startDateUTC}&endDate=${endDateUTC}`;
      if (selectedProfessionalId) {
        appointmentsUrl += `&professionalId=${selectedProfessionalId}`;
      }

      console.log('📅 Carregando agendamentos para:', {
        selectedDate: selectedDate.toLocaleDateString('pt-BR'),
        startDateLocal: startDateLocal.toLocaleString('pt-BR'),
        endDateLocal: endDateLocal.toLocaleString('pt-BR'),
        startDateUTC,
        endDateUTC,
        url: appointmentsUrl
      });

      const [appointmentsRes, clientsRes, servicesRes, professionalsRes] = await Promise.all([
        fetch(appointmentsUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/professionals`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        console.log('📋 Agendamentos recebidos do backend:', data.appointments?.length || 0);
        if (data.appointments && data.appointments.length > 0) {
          console.log('📋 Detalhes dos agendamentos:', data.appointments.map((apt: Appointment) => ({
            id: apt.id,
            startTime: apt.startTime,
            startTimeLocal: new Date(apt.startTime).toLocaleString('pt-BR'),
            startTimeDate: new Date(apt.startTime).toLocaleDateString('pt-BR'),
            client: apt.client.name,
          })));
        }
        setAppointments(data.appointments || []);
      } else {
        console.error('❌ Erro ao buscar agendamentos:', appointmentsRes.status, appointmentsRes.statusText);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }
      if (professionalsRes.ok) {
        const data = await professionalsRes.json();
        setProfessionals(data.professionals || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Primeiro dia do mês
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      firstDay.setHours(0, 0, 0, 0);
      
      // Último dia do mês
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      lastDay.setHours(23, 59, 59, 999);

      let appointmentsUrl = `${API_URL}/appointments?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`;
      if (selectedProfessionalId) {
        appointmentsUrl += `&professionalId=${selectedProfessionalId}`;
      }

      const response = await fetch(appointmentsUrl, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (response.ok) {
        const data = await response.json();
        setMonthAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos do mês:', error);
    }
  };

  const getAppointmentsForDay = (date: Date) => {
    return monthAppointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adicionar dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Usar data do formulário ou data selecionada como fallback
      const appointmentDate = formData.date || selectedDateString;
      
      // Criar data corretamente considerando timezone local
      // Parse da data e hora separadamente para evitar problemas de timezone
      const [year, month, day] = appointmentDate.split('-').map(Number);
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      
      // Criar data no timezone local
      const localDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // Converter para ISO string (que será em UTC)
      const dateTimeISO = localDateTime.toISOString();
      
      const method = editingAppointment ? 'PUT' : 'POST';
      const url = editingAppointment
        ? `${API_URL}/appointments/${editingAppointment.id}`
        : `${API_URL}/appointments`;

      console.log('📅 Criando/Editando agendamento:', {
        appointmentDate,
        startTime: formData.startTime,
        localDateTime: localDateTime.toLocaleString('pt-BR'),
        dateTimeISO,
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          professionalId: formData.professionalId || null,
          startTime: dateTimeISO,
          status: editingAppointment ? formData.status : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: editingAppointment ? 'Agendamento atualizado!' : 'Agendamento criado!',
          description: editingAppointment
            ? 'O agendamento foi atualizado com sucesso.'
            : 'O agendamento foi criado com sucesso.',
          variant: 'success',
        });
        setOpen(false);
        setEditOpen(false);
        setEditingAppointment(null);
        setFormData({
          clientId: '',
          serviceId: '',
          professionalId: '',
          date: '',
          startTime: '',
          notes: '',
          status: 'PENDING',
        });
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || (editingAppointment ? 'Erro ao atualizar agendamento' : 'Erro ao criar agendamento'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const startDate = new Date(appointment.startTime);
    const timeString = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

    const dateString = startDate.toISOString().split('T')[0];
    setFormData({
      clientId: appointment.client.id,
      serviceId: appointment.service.id,
      professionalId: appointment.professional?.id || '',
      date: dateString,
      startTime: timeString,
      notes: appointment.notes || '',
      status: appointment.status as any,
    });
    setEditOpen(true);
  };

  const handleConfirm = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Agendamento confirmado!',
          description: 'O agendamento foi confirmado com sucesso.',
          variant: 'success',
        });
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao confirmar agendamento',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'COMPLETED',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Agendamento concluído!',
          description: 'O agendamento foi marcado como concluído e uma transação de receita foi criada automaticamente.',
          variant: 'success',
        });
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao concluir agendamento',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingAppointment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/appointments/${deletingAppointment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: 'Agendamento deletado!',
          description: 'O agendamento foi removido com sucesso.',
          variant: 'success',
        });
        setDeleteOpen(false);
        setDeletingAppointment(null);
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao deletar agendamento',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Função auxiliar para normalizar data para o fuso horário local
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Função auxiliar para comparar se duas datas são o mesmo dia (ignorando hora)
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getAppointmentsForHour = (hour: number) => {
    // Normalizar a data selecionada (sem hora, apenas dia)
    const selectedDateNormalized = new Date(selectedDate);
    selectedDateNormalized.setHours(0, 0, 0, 0);
    
    const selectedDay = selectedDateNormalized.getDate();
    const selectedMonth = selectedDateNormalized.getMonth();
    const selectedYear = selectedDateNormalized.getFullYear();
    
    const filtered = appointments.filter((apt) => {
      // Converter a data do agendamento (que vem em UTC/ISO) para timezone local
      const aptDate = new Date(apt.startTime);
      
      // Normalizar para comparar apenas dia, mês e ano (ignorar hora inicialmente)
      const aptDay = aptDate.getDate();
      const aptMonth = aptDate.getMonth();
      const aptYear = aptDate.getFullYear();
      const aptHour = aptDate.getHours();
      
      // Verificar se está no mesmo dia E mesma hora
      const isSameDayAndHour = aptYear === selectedYear && 
                               aptMonth === selectedMonth && 
                               aptDay === selectedDay && 
                               aptHour === hour;
      
      // Log detalhado para debug
      if (aptYear === selectedYear && aptMonth === selectedMonth && aptDay === selectedDay) {
        console.log(`🔍 Agendamento encontrado no dia ${selectedDay}/${selectedMonth + 1}/${selectedYear}, hora ${aptHour}, filtrado para ${hour}:`, {
          aptId: apt.id,
          aptHour,
          filterHour: hour,
          matches: isSameDayAndHour,
          aptDateLocal: aptDate.toLocaleString('pt-BR'),
        });
      }
      
      return isSameDayAndHour;
    });
    
    // Log para debug (apenas se houver agendamentos)
    if (filtered.length > 0) {
      console.log(`⏰ Hora ${hour}:00 - ${filtered.length} agendamento(s)`, filtered);
    }
    
    return filtered;
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => setSelectedDate(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const today = new Date();
  const isToday = isSameDay(selectedDate, today);
  const currentTimePosition = isToday ? ((currentHour - 8) * 100 + (currentMinute / 60) * 100) : null;

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-4 md:mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="p-2 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Calendar className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-1 truncate">Agenda Elegante</h1>
                  <p className="text-white/80 text-sm md:text-base lg:text-lg truncate">
                    {selectedProfessionalId
                      ? `Agenda de ${professionals.find(p => p.id === selectedProfessionalId)?.name || 'Profissional'}`
                      : 'Gerencie seus agendamentos com sofisticação'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
              {/* Seletor de Profissional */}
              <select
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                className="h-10 px-3 md:px-4 rounded-lg bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base flex-1 sm:flex-none min-w-0"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="bg-primary text-white">Todos os Profissionais</option>
                {professionals.filter(p => p.isActive !== false).map((professional) => (
                  <option key={professional.id} value={professional.id} className="bg-primary text-white">
                    {professional.name}
                  </option>
                ))}
              </select>

              {/* Dialog de Novo Agendamento */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/80 hover:bg-white/90 text-foreground border-2 border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="hidden sm:inline">Novo Agendamento</span>
                    <span className="sm:hidden">Novo</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-card border-2 border-primary/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl lg:text-3xl flex items-center gap-2 md:gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      Novo Agendamento
                    </DialogTitle>
                    <DialogDescription className="text-sm md:text-base">
                      Crie um novo agendamento para seu cliente
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {/* ... (formulário de novo agendamento - idêntico ao anterior) ... */}
                    <div className="space-y-2">
                      <Label htmlFor="clientId" className="text-base font-semibold">Cliente *</Label>
                      <select
                        id="clientId"
                        className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        required
                      >
                        <option value="">Selecione um cliente</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceId" className="text-base font-semibold">Serviço *</Label>
                      <select
                        id="serviceId"
                        className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        required
                      >
                        <option value="">Selecione um serviço</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - R$ {service.price.toFixed(2).replace('.', ',')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professionalId" className="text-base font-semibold">Profissional</Label>
                      <select
                        id="professionalId"
                        className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.professionalId}
                        onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                      >
                        <option value="">Sem profissional específico</option>
                        {professionals.map((professional) => (
                          <option key={professional.id} value={professional.id}>{professional.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm md:text-base font-semibold">Data *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date || selectedDateString}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="h-11 md:h-12 bg-background border-2 border-input focus:border-primary text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-sm md:text-base font-semibold">Horário *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          required
                          className="h-11 md:h-12 bg-background border-2 border-input focus:border-primary text-sm md:text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-base font-semibold">Observações</Label>
                      <textarea
                        id="notes"
                        className="flex min-h-[100px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Observações opcionais sobre o agendamento"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Agendar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl bg-card border-2 border-primary/30 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl lg:text-3xl flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              Editar Agendamento
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">Atualize as informações do agendamento</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Formulário de edição (igual ao anterior, com campos "edit-") */}
            <div className="space-y-2">
              <Label htmlFor="edit-clientId" className="text-base font-semibold">Cliente *</Label>
              <select
                id="edit-clientId"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-serviceId" className="text-base font-semibold">Serviço *</Label>
              <select
                id="edit-serviceId"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                required
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toFixed(2).replace('.', ',')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-professionalId" className="text-base font-semibold">Profissional</Label>
              <select
                id="edit-professionalId"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.professionalId}
                onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
              >
                <option value="">Sem profissional específico</option>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>{professional.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-sm md:text-base font-semibold">Data *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="h-11 md:h-12 bg-background border-2 border-input focus:border-primary text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startTime" className="text-sm md:text-base font-semibold">Horário *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="h-11 md:h-12 bg-background border-2 border-input focus:border-primary text-sm md:text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-base font-semibold">Status *</Label>
              <select
                id="edit-status"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                required
              >
                <option value="PENDING">Pendente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="NO_SHOW">Falta</option>
              </select>
              {formData.status === 'COMPLETED' && (
                <p className="text-xs text-green-500 mt-1">
                  Ao marcar como concluído, uma transação de receita será criada automaticamente
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="text-base font-semibold">Observações</Label>
              <textarea
                id="edit-notes"
                className="flex min-h-[100px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações opcionais sobre o agendamento"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditOpen(false);
                  setEditingAppointment(null);
                  setFormData({
                    clientId: '',
                    serviceId: '',
                    professionalId: '',
                    date: '',
                    startTime: '',
                    notes: '',
                    status: 'PENDING',
                  });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all">
                <Sparkles className="w-5 h-5 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o agendamento de <strong>{deletingAppointment?.client.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeletingAppointment(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Deletar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs para Dia/Mês */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          const newTab = value as 'day' | 'month';
          setActiveTab(newTab);
          if (newTab === 'month') {
            setMonthCalendarOpen(true);
            setCurrentMonth(new Date(selectedDate));
          }
        }}
      >
        <div className="flex justify-center mb-4">
          <TabsList className="bg-muted/50 border-2 border-primary/30">
            <TabsTrigger value="day" className="px-6">
              <Clock className="w-4 h-4 mr-2" />
              Dia
            </TabsTrigger>
            <TabsTrigger value="month" className="px-6">
              <Calendar className="w-4 h-4 mr-2" />
              Mês
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dialog do Calendário Mensal */}
        <Dialog open={monthCalendarOpen} onOpenChange={(open) => {
          setMonthCalendarOpen(open);
          if (!open) {
            setActiveTab('day');
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Agendamentos do Mês
              </DialogTitle>
              <DialogDescription>
                Visualize todos os agendamentos do mês em um calendário completo
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Navegação do Mês */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(-1)}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-xl font-bold">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(1)}
                  className="h-10 w-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendário */}
              <div className="border-2 border-primary/30 rounded-lg overflow-hidden">
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b-2 border-primary/20">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="p-3 text-center font-bold text-sm border-r border-primary/20 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7">
                  {getDaysInMonth().map((date, index) => {
                    if (!date) {
                      return <div key={index} className="min-h-[100px] border-r border-b border-primary/20 last:border-r-0" />;
                    }

                    const dayAppointments = getAppointmentsForDay(date);
                    const isToday = isSameDay(date, new Date());
                    const isSelected = isSameDay(date, selectedDate);

                    return (
                      <div
                        key={index}
                        className={`relative min-h-[100px] p-2 border-r border-b border-primary/20 last:border-r-0 ${
                          isToday ? 'bg-primary/10' : ''
                        } ${isSelected ? 'ring-2 ring-primary' : ''} hover:bg-primary/5 transition-colors`}
                      >
                        <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {date.getDate()}
                        </div>
                        <div 
                          className="space-y-1 cursor-pointer"
                          onClick={() => {
                            setSelectedDate(date);
                            setMonthCalendarOpen(false);
                            setActiveTab('day');
                          }}
                        >
                          {dayAppointments.slice(0, 2).map((apt) => {
                            const statusColors = getStatusColor(apt.status);
                            return (
                              <div
                                key={apt.id}
                                className={`text-[10px] p-1 rounded ${statusColors.bg} ${statusColors.text} truncate hover:opacity-80 border ${statusColors.border}`}
                                title={`${formatTime(apt.startTime)} - ${apt.client.name} - ${apt.service.name}`}
                              >
                                {formatTime(apt.startTime)} {apt.client.name.split(' ')[0]}
                              </div>
                            );
                          })}
                          {dayAppointments.length > 2 && (
                            <div className="text-[10px] text-muted-foreground font-semibold hover:text-primary">
                              +{dayAppointments.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="day" className="space-y-4">
      {/* Navegação de Data */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateDate(-1)} className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-foreground transition-all flex-shrink-0">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <div className="text-center flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 px-2">
                <span className="hidden md:inline">
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="md:hidden">
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </h2>
              {isToday && (
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  <span className="text-xs md:text-sm font-semibold text-primary">Hoje</span>
                </div>
              )}
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} programado{appointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={goToToday} className="h-10 md:h-12 px-3 md:px-4 text-xs md:text-sm border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-foreground transition-all">
                <span className="hidden sm:inline">Hoje</span>
                <span className="sm:hidden">Hoje</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateDate(1)} className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-foreground transition-all">
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline do Dia */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b-2 border-primary/20 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl lg:text-2xl flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="hidden sm:inline">Timeline do Dia</span>
                <span className="sm:hidden">Timeline</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm lg:text-base mt-1 hidden sm:block">
                Visualize todos os agendamentos do dia em uma linha do tempo elegante
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {/* Linha do tempo atual */}
            {isToday && currentTimePosition !== null && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentTimePosition}px` }}>
                <div className="relative">
                  <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  <div className="absolute -left-3 -top-2.5 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  </div>
                  <div className="absolute right-4 -top-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-lg">
                    {String(currentHour).padStart(2, '0')}:{String(currentMinute).padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-border/30" key={`timeline-${selectedDateString}`}>
              {hours.map((hour) => {
                const hourAppointments = getAppointmentsForHour(hour);
                // Para datas futuras, não considerar como "past" ou "current"
                const isPast = isToday && hour < currentHour;
                const isCurrent = isToday && hour === currentHour;

                return (
                  <div
                    key={hour}
                    className={`relative min-h-[80px] md:min-h-[100px] grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-5 ${isPast ? 'opacity-60' : ''} ${isCurrent ? 'bg-primary/5' : ''}`}
                  >
                    <div className="col-span-2 sm:col-span-1 flex items-center">
                      <div className={`text-sm md:text-base lg:text-lg font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                        {String(hour).padStart(2, '0')}:00
                      </div>
                    </div>

                    <div className="col-span-10 sm:col-span-11 relative">
                      {hourAppointments.length > 0 ? (
                        <div className="space-y-3">
                          {hourAppointments.map((apt) => {
                            const statusColors = getStatusColor(apt.status);
                            const categoryGradient = getCategoryGradient(apt.service.category);
                            const categoryIcon = getCategoryIcon(apt.service.category);

                            return (
                              <div
                                key={apt.id}
                                className={`group relative rounded-xl p-4 border-2 ${statusColors.border} ${statusColors.bg} hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer`}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-r ${categoryGradient} opacity-10 rounded-xl`} />

                                <div className="relative z-10">
                                  <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
                                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                      <div className={`text-lg md:text-xl lg:text-2xl p-1.5 md:p-2 rounded-lg bg-gradient-to-br ${categoryGradient} bg-opacity-20 flex-shrink-0`}>
                                        {categoryIcon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 md:gap-2 mb-1">
                                          <User className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                                          <span className="font-bold text-sm md:text-base truncate">{apt.client.name}</span>
                                        </div>
                                        <p className="text-xs md:text-sm font-semibold text-foreground mb-1 truncate">{apt.service.name}</p>
                                      </div>
                                    </div>
                                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-bold ${statusColors.text} ${statusColors.bg} border-2 ${statusColors.border} whitespace-nowrap flex-shrink-0`}>
                                      {getStatusLabel(apt.status)}
                                    </span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 flex-wrap">
                                    <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
                                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                                      <span className="font-medium">
                                        {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
                                      <span className="font-bold text-primary">
                                        R$ {apt.service.price.toFixed(2).replace('.', ',')}
                                      </span>
                                    </div>
                                    {apt.professional && (
                                      <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm text-muted-foreground">
                                        <User className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span className="truncate">{apt.professional.name}</span>
                                      </div>
                                    )}
                                  </div>

                                  {apt.notes && (
                                    <div className="mt-3 pt-3 border-t border-border/30">
                                      <p className="text-xs text-muted-foreground italic flex items-start gap-2">
                                        <span>📝</span>
                                        <span>{apt.notes}</span>
                                      </p>
                                    </div>
                                  )}

                                  <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border/30 flex flex-wrap gap-1.5 md:gap-2">
                                    {apt.status === 'PENDING' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleConfirm(apt.id)}
                                        className="flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/30 hover:border-blue-500/50 text-xs"
                                      >
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">Confirmar</span>
                                        <span className="sm:hidden">OK</span>
                                      </Button>
                                    )}
                                    {(apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS') && !apt.transaction && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleComplete(apt.id)}
                                        className="flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/30 hover:border-green-500/50 text-xs"
                                      >
                                        <BadgeDollarSign className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">Concluir</span>
                                        <span className="sm:hidden">✓</span>
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(apt)} className="flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 text-xs">
                                      <Pencil className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Editar</span>
                                      <span className="sm:hidden">✎</span>
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        setDeletingAppointment(apt);
                                        setDeleteOpen(true);
                                      }}
                                      className="flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 text-xs"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Deletar</span>
                                      <span className="sm:hidden">🗑</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground/50 italic py-4">
                          Sem agendamentos neste horário
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}