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

interface Client { id: string; name: string; }
interface Service { id: string; name: string; duration: number; price: number; }
interface Professional { id: string; name: string; isActive?: boolean; }

const hours = Array.from({ length: 14 }, (_, i) => i + 8);
const hourMarkers = Array.from({ length: 7 }, (_, i) => (i * 2) + 8);

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; bgStyle?: string; borderStyle?: string }> = {
    PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
    CONFIRMED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
    IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
    COMPLETED: { 
      bg: 'bg-green-500/20', 
      text: 'text-green-600', 
      border: 'border-green-500/50',
      bgStyle: 'rgba(34, 197, 94, 0.3)', // Verde mais intenso
      borderStyle: 'rgba(34, 197, 94, 0.7)' // Borda verde mais intensa
    },
    CANCELLED: { 
      bg: 'bg-red-500/20', 
      text: 'text-red-600', 
      border: 'border-red-500/50',
      bgStyle: 'rgba(239, 68, 68, 0.3)', // Vermelho mais intenso
      borderStyle: 'rgba(239, 68, 68, 0.7)' // Borda vermelha mais intensa
    },
    NO_SHOW: { 
      bg: 'bg-red-500/20', 
      text: 'text-red-600', 
      border: 'border-red-500/50',
      bgStyle: 'rgba(239, 68, 68, 0.3)', // Vermelho mais intenso
      borderStyle: 'rgba(239, 68, 68, 0.7)' // Borda vermelha mais intensa
    },
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
    status: 'PENDING' as const,
  });

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedProfessionalId]);

  useEffect(() => {
    if (activeTab === 'month' || monthCalendarOpen) {
      loadMonthData();
    }
  }, [currentMonth, selectedProfessionalId, activeTab, monthCalendarOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      const startDateLocal = new Date(year, month, day, 0, 0, 0, 0);
      const endDateLocal = new Date(year, month, day, 23, 59, 59, 999);

      const startDateUTC = startDateLocal.toISOString();
      const endDateUTC = endDateLocal.toISOString();

      let appointmentsUrl = `${API_URL}/appointments?startDate=${startDateUTC}&endDate=${endDateUTC}`;
      if (selectedProfessionalId) appointmentsUrl += `&professionalId=${selectedProfessionalId}`;

      const [appointmentsRes, clientsRes, servicesRes, professionalsRes] = await Promise.all([
        fetch(appointmentsUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/professionals`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (appointmentsRes.ok) setAppointments((await appointmentsRes.json()).appointments || []);
      if (clientsRes.ok) setClients((await clientsRes.json()).clients || []);
      if (servicesRes.ok) setServices((await servicesRes.json()).services || []);
      if (professionalsRes.ok) setProfessionals((await professionalsRes.json()).professionals || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthData = async () => {
    try {
      const token = localStorage.getItem('token');
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      firstDay.setHours(0, 0, 0, 0);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      lastDay.setHours(23, 59, 59, 999);

      let url = `${API_URL}/appointments?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`;
      if (selectedProfessionalId) url += `&professionalId=${selectedProfessionalId}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMonthAppointments((await res.json()).appointments || []);
    } catch (error) {
      console.error('Erro ao carregar mês:', error);
    }
  };

  const getAppointmentsForDay = (date: Date) => {
    return monthAppointments.filter((apt) => {
      const d = new Date(apt.startTime);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const navigateMonth = (dir: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const date = formData.date || selectedDateString;
      const [y, m, d] = date.split('-').map(Number);
      const [h, min] = formData.startTime.split(':').map(Number);
      // Criar data local (será convertida para UTC pelo toISOString())
      const localDate = new Date(y, m - 1, d, h, min);
      const iso = localDate.toISOString();

      const method = editingAppointment ? 'PUT' : 'POST';
      const url = editingAppointment ? `${API_URL}/appointments/${editingAppointment.id}` : `${API_URL}/appointments`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          professionalId: formData.professionalId || null,
          startTime: iso,
          status: editingAppointment ? formData.status : undefined,
        }),
      });

      if (res.ok) {
        toast({ title: editingAppointment ? 'Atualizado!' : 'Criado!', variant: 'success' });
        setOpen(false); setEditOpen(false); setEditingAppointment(null);
        setFormData({ clientId: '', serviceId: '', professionalId: '', date: '', startTime: '', notes: '', status: 'PENDING' });
        loadData();
      } else {
        const data = await res.json();
        toast({ title: 'Erro', description: data.error || 'Falha na operação', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro', description: 'Sem conexão com o servidor', variant: 'destructive' });
    }
  };

  const handleEdit = (apt: Appointment) => {
    const start = new Date(apt.startTime);
    // Converter para timezone local do Brasil usando toLocaleString
    const localTimeString = start.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const localDate = new Date(localTimeString);
    
    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    
    setEditingAppointment(apt);
    setFormData({
      clientId: apt.client.id,
      serviceId: apt.service.id,
      professionalId: apt.professional?.id || '',
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      startTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      notes: apt.notes || '',
      status: apt.status as any,
    });
    setEditOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAppointment) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/appointments/${deletingAppointment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: 'Deletado!', variant: 'success' });
        setDeleteOpen(false); setDeletingAppointment(null); loadData();
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao deletar', variant: 'destructive' });
    }
  };

  const formatTime = (date: string) => {
    const dateObj = new Date(date);
    // Usar timezone do Brasil (America/Sao_Paulo) para exibir corretamente
    return dateObj.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };
  
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    // Usar timezone do Brasil (America/Sao_Paulo) para exibir corretamente
    return dateObj.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

  const getDayAppointments = () => appointments.filter(a => isSameDay(new Date(a.startTime), selectedDate));

  const getAppointmentPosition = (apt: Appointment) => {
    const start = new Date(apt.startTime);
    const dayStart = new Date(selectedDate); dayStart.setHours(8, 0, 0, 0);
    const minutesFromStart = (start.getTime() - dayStart.getTime()) / 60000;
    const duration = apt.service.duration;
    const pixelsPerMinute = 0.67;
    // Adiciona um offset maior (15px) para que os agendamentos não fiquem exatamente nas linhas de hora
    const offsetFromHourLine = 15;
    const top = (minutesFromStart * pixelsPerMinute) + offsetFromHourLine;
    const height = Math.max(duration * pixelsPerMinute, 35);
    return { top, height };
  };

  const appointmentsOverlap = (a1: Appointment, a2: Appointment) =>
    new Date(a1.startTime) < new Date(a2.endTime) && new Date(a1.endTime) > new Date(a2.startTime);

  const organizeOverlappingAppointments = (appts: Appointment[]) => {
    const sorted = [...appts].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const columns: Appointment[][] = [];
    sorted.forEach(apt => {
      let placed = false;
      for (const col of columns) {
        if (!col.some(ex => appointmentsOverlap(ex, apt))) {
          col.push(apt); placed = true; break;
        }
      }
      if (!placed) columns.push([apt]);
    });
    return columns;
  };

  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const goToToday = () => setSelectedDate(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Calendar className="w-5 h-5 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-1">Agenda Elegante</h1>
                <p className="text-white/80 text-sm md:text-lg">
                  {selectedProfessionalId ? `Agenda de ${professionals.find(p => p.id === selectedProfessionalId)?.name || 'Profissional'}` : 'Gerencie seus agendamentos com sofisticação'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <select
                value={selectedProfessionalId}
                onChange={e => setSelectedProfessionalId(e.target.value)}
                className="h-10 px-3 md:px-4 rounded-lg bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base"
              >
                <option value="">Todos os Profissionais</option>
                {professionals.filter(p => p.isActive !== false).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/80 hover:bg-white/90 text-foreground border-2 border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Novo Agendamento
                    </DialogTitle>
                    <DialogDescription>Crie um novo agendamento para seu cliente</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Cliente *</Label>
                      <select
                        id="clientId"
                        className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2"
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
                      <Label htmlFor="serviceId">Serviço *</Label>
                      <select
                        id="serviceId"
                        className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2"
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        required
                      >
                        <option value="">Selecione um serviço</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professionalId">Profissional</Label>
                      <select
                        id="professionalId"
                        className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2"
                        value={formData.professionalId}
                        onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                      >
                        <option value="">Sem profissional específico</option>
                        {professionals.filter(p => p.isActive !== false).map((professional) => (
                          <option key={professional.id} value={professional.id}>{professional.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Data *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date || selectedDateString}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Horário *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Observações sobre o agendamento..."
                        className="h-12"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white">
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

      {/* Tabs Dia / Mês */}
      <Tabs value={activeTab} onValueChange={v => {
        setActiveTab(v as any);
        if (v === 'month') {
          setMonthCalendarOpen(true);
          setCurrentMonth(new Date(selectedDate));
        }
      }}>
        <div className="flex justify-center mb-4">
          <TabsList className="bg-muted/50 border-2 border-primary/30">
            <TabsTrigger value="day"><Clock className="w-4 h-4 mr-2" />Dia</TabsTrigger>
            <TabsTrigger value="month"><Calendar className="w-4 h-4 mr-2" />Mês</TabsTrigger>
          </TabsList>
        </div>

        {/* Calendário Mensal */}
        <Dialog open={monthCalendarOpen} onOpenChange={o => {
          setMonthCalendarOpen(o);
          if (!o) setActiveTab('day');
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-4 md:p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b-2 border-primary/20">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </DialogTitle>
                <DialogDescription>Visualize todos os agendamentos do mês. Clique em um dia para ver a timeline.</DialogDescription>
              </div>
            </DialogHeader>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-7 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b-2 border-primary/20">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="p-3 text-center font-bold text-sm border-r border-primary/20 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
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
                      } ${isSelected ? 'ring-2 ring-primary' : ''} transition-colors cursor-pointer`}
                      onClick={() => {
                        setSelectedDate(date);
                        setMonthCalendarOpen(false);
                        setActiveTab('day');
                      }}
                    >
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((apt) => {
                          const statusColors = getStatusColor(apt.status);
                          return (
                            <div
                              key={apt.id}
                              className={`text-[10px] p-1 rounded ${statusColors.bg} ${statusColors.text} truncate border ${statusColors.border}`}
                              title={`${formatTime(apt.startTime)} - ${apt.client.name} - ${apt.service.name}`}
                            >
                              {formatTime(apt.startTime)} {apt.client.name.split(' ')[0]}
                            </div>
                          );
                        })}
                        {dayAppointments.length > 2 && (
                          <div className="text-[10px] text-muted-foreground font-semibold">
                            +{dayAppointments.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="day" className="space-y-4">
          {/* Navegação de Data */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-2 md:gap-4">
                <Button variant="outline" size="icon" onClick={() => navigateDate(-1)} className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary/30 hover:border-primary transition-all">
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <div className="flex-1 text-center">
                  <h2 className="text-lg md:text-2xl font-bold text-foreground">
                    {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  {isToday && (
                    <p className="text-sm text-primary font-semibold mt-1">Hoje</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={goToToday} className="h-10 md:h-12 px-3 md:px-4 text-xs md:text-sm border-2 border-primary/30 hover:border-primary transition-all">
                    Hoje
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateDate(1)} className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary/30 hover:border-primary transition-all">
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline do Dia */}
          <div className="border-2 border-primary/30 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden rounded-xl flex flex-col text-card-foreground">
            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 border-b-2 border-primary/20 pb-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="leading-none font-semibold text-lg md:text-xl lg:text-2xl flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="hidden sm:inline">Timeline do Dia</span>
                    <span className="sm:hidden">Timeline</span>
                  </div>
                  <div className="text-muted-foreground text-xs md:text-sm lg:text-base mt-1 hidden sm:block">
                    Visualize todos os agendamentos do dia em uma linha do tempo elegante
                  </div>
                </div>
              </div>
            </div>
            <div className="p-0">
              <div className="relative">
                {/* Linha do tempo atual */}
                {isToday && (() => {
                  const now = new Date();
                  const dayStart = new Date(now);
                  dayStart.setHours(8, 0, 0, 0);
                  const minutesSinceStart = (now.getTime() - dayStart.getTime()) / (1000 * 60);
                  const currentTop = minutesSinceStart * 0.67;
                  if (currentTop < 0 || currentTop > 560) return null;
                  return (
                    <div className="absolute left-20 sm:left-24 md:left-28 right-0 z-20 pointer-events-none" style={{ top: `${currentTop}px` }}>
                      <div className="relative">
                        <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                        <div className="absolute left-0 -top-2.5 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        </div>
                        <div className="absolute right-4 -top-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-lg">
                          {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Timeline com posicionamento absoluto */}
                <div className="relative" key={`timeline-${selectedDateString}`} style={{ minHeight: '560px' }}>
                  {/* Linhas de hora (a cada 2 horas) */}
                  {hourMarkers.map((hour) => {
                    const isPast = isToday && hour < new Date().getHours();
                    const isCurrent = isToday && hour === new Date().getHours();
                    const topPosition = (hour - 8) * 40;
                    return (
                      <div key={hour}>
                        {/* Linha horizontal completa (atrás dos agendamentos) */}
                        <div
                          className={`absolute left-20 sm:left-24 md:left-28 right-0 border-t border-border/30 ${isPast ? 'opacity-40' : ''}`}
                          style={{ top: `${topPosition}px` }}
                        />
                        {/* Marcador de hora (área esquerda) */}
                        <div
                          className={`absolute left-0 border-t border-border/30 ${isPast ? 'opacity-40' : ''}`}
                          style={{ 
                            top: `${topPosition}px`,
                            width: '80px', // Largura fixa para a área dos marcadores
                          }}
                        >
                          <div className="flex items-center h-[40px] px-3 md:px-5">
                            <div className={`w-16 sm:w-20 text-sm md:text-base font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                              {String(hour).padStart(2, '0')}:00
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Linha divisória vertical entre marcadores e agendamentos */}
                  <div className="absolute left-20 sm:left-24 md:left-28 top-0 bottom-0 w-px bg-border/30 z-10" />

                  {/* Agendamentos posicionados absolutamente */}
                  <div className="absolute left-20 sm:left-24 md:left-28 right-0 top-0 bottom-0 pr-3 md:pr-5" style={{ minHeight: '560px' }}>
                    {(() => {
                      const dayAppointments = getDayAppointments();
                      const columns = organizeOverlappingAppointments(dayAppointments);
                      return columns.map((column, colIndex) => (
                        <div
                          key={`col-${colIndex}`}
                          className="absolute top-0 bottom-0"
                          style={{
                            left: `${colIndex * (90 / Math.max(columns.length, 1))}%`,
                            width: `${90 / Math.max(columns.length, 1)}%`,
                            paddingRight: '4px',
                          }}
                        >
                          {column.map((apt) => {
                            const { top, height } = getAppointmentPosition(apt);
                            const statusColors = getStatusColor(apt.status);
                            const categoryGradient = getCategoryGradient(apt.service.category);
                            const durationMinutes = apt.service.duration;
                            const durationHours = Math.floor(durationMinutes / 60);
                            const durationMins = durationMinutes % 60;
                            const durationText = durationHours > 0
                              ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}min` : ''}`
                              : `${durationMinutes}min`;

                            return (
                              <div
                                key={apt.id}
                                className="group absolute left-0 rounded-lg border-2 p-2 overflow-hidden cursor-pointer hover:z-20 transition-all z-10"
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  minHeight: '35px',
                                  width: 'calc(100% - 4px)',
                                  maxWidth: '200px',
                                  backgroundColor: statusColors.bgStyle || statusColors.bg.replace('/20', '/30'),
                                  borderColor: statusColors.borderStyle || statusColors.border.replace('/50', '/70'),
                                }}
                                onClick={() => handleEdit(apt)}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-r ${categoryGradient} opacity-10 rounded-lg`} />
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                  {/* Horários de início e fim - Destaque principal */}
                                  <div className="mb-1.5 pb-1.5 border-b border-primary/20">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                                      <div className="flex-1">
                                        <div className="text-[10px] font-bold text-primary leading-tight">
                                          {formatTime(apt.startTime)}
                                        </div>
                                        <div className="text-[9px] font-semibold text-muted-foreground leading-tight">
                                          até {formatTime(apt.endTime)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Cliente e Status */}
                                  <div className="flex items-start justify-between gap-1.5 mb-1">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      <User className="w-3 h-3 text-primary flex-shrink-0" />
                                      <span className="font-bold text-xs text-foreground truncate leading-tight">
                                        {apt.client.name}
                                      </span>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${statusColors.text} ${statusColors.bg} border ${statusColors.border} whitespace-nowrap flex-shrink-0`}>
                                      {getStatusLabel(apt.status).charAt(0)}
                                    </span>
                                  </div>

                                  {/* Serviço e Duração */}
                                  <div className="mb-1">
                                    <p className="text-[10px] font-semibold text-muted-foreground truncate">
                                      {apt.service.name}
                                    </p>
                                    <span className="text-[9px] font-semibold text-muted-foreground">
                                      ({durationText})
                                    </span>
                                  </div>

                                  {/* Preço */}
                                  <div className="mt-auto">
                                    <span className="text-xs font-bold text-primary">
                                      R$ {apt.service.price.toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Editar Agendamento
            </DialogTitle>
            <DialogDescription>Edite as informações do agendamento</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clientId">Cliente *</Label>
              <select
                id="edit-clientId"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2"
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
              <Label htmlFor="edit-serviceId">Serviço *</Label>
              <select
                id="edit-serviceId"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                required
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-professionalId">Profissional</Label>
              <select
                id="edit-professionalId"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2"
                value={formData.professionalId}
                onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
              >
                <option value="">Sem profissional específico</option>
                {professionals.filter(p => p.isActive !== false).map((professional) => (
                  <option key={professional.id} value={professional.id}>{professional.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Data *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date || selectedDateString}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Horário *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="PENDING">Pendente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="NO_SHOW">Falta</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o agendamento..."
                className="h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1 h-12">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary text-white">
                <Sparkles className="w-5 h-5 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}