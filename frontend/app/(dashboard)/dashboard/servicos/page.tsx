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
import { beautyServices } from '@/lib/services-data';

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  duration: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

const categoryConfig: Record<string, { icon: string; gradient: string; color: string }> = {
  'Cabelo': { icon: '✂️', gradient: 'from-blue-500 via-cyan-500 to-teal-500', color: 'bg-blue-500/20 text-blue-400' },
  'Manicure': { icon: '💅', gradient: 'from-pink-600 via-rose-600 to-fuchsia-600', color: 'bg-pink-600/25 text-pink-500' },
  'Pedicure': { icon: '👣', gradient: 'from-purple-500 via-violet-500 to-purple-600', color: 'bg-purple-500/20 text-purple-400' },
  'Estética': { icon: '✨', gradient: 'from-amber-500 via-orange-500 to-yellow-500', color: 'bg-amber-500/20 text-amber-400' },
  'Depilação': { icon: '🪶', gradient: 'from-violet-500 via-purple-500 to-indigo-500', color: 'bg-violet-500/20 text-violet-400' },
  'Maquiagem': { icon: '💄', gradient: 'from-rose-500 via-pink-500 to-red-500', color: 'bg-rose-500/20 text-rose-400' },
};

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeTab, setActiveTab] = useState<'predefined' | 'manual'>('predefined');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: 60,
    price: 0,
  });

  const categories = ['Todos', 'Cabelo', 'Manicure', 'Pedicure', 'Estética', 'Depilação', 'Maquiagem', 'Outros'];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/services', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          duration: Number(formData.duration),
          price: Number(formData.price),
        }),
      });

      if (response.ok) {
        setOpen(false);
        setActiveTab('predefined');
        setFormData({
          name: '',
          description: '',
          category: '',
          duration: 60,
          price: 0,
        });
        await loadServices();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao criar serviço');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      duration: service.duration,
      price: service.price,
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          duration: Number(formData.duration),
          price: Number(formData.price),
        }),
      });

      if (response.ok) {
        setEditOpen(false);
        setEditingService(null);
        setFormData({
          name: '',
          description: '',
          category: '',
          duration: 60,
          price: 0,
        });
        loadServices();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao atualizar serviço');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
    }
  };

  const handleQuickAdd = async (service: typeof beautyServices[0]) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          category: service.category,
          duration: service.duration,
          price: service.price,
        }),
      });

      if (response.ok) {
        await loadServices();
        // Não fecha o dialog, permite adicionar mais serviços
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao adicionar serviço');
      }
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      alert('Erro ao conectar com o servidor');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const filteredServices = selectedCategory === 'Todos' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Glamouroso */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Serviços
          </h1>
          <p className="text-muted-foreground text-lg">Gerencie os serviços oferecidos no seu salão</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setActiveTab('predefined');
            setFormData({ name: '', description: '', category: '', duration: 60, price: 0 });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg">
              + Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl glass-pink border-2 border-pink-600/40 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Adicionar Serviço</DialogTitle>
              <DialogDescription>Escolha um serviço pré-definido por categoria ou crie um personalizado</DialogDescription>
            </DialogHeader>
            
            {/* Tabs para Pré-definidos e Manual */}
            <div className="flex gap-2 mb-6 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab('predefined')}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === 'predefined'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                📋 Serviços Pré-definidos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === 'manual'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ✏️ Criar Manualmente
              </button>
            </div>

            {/* Conteúdo da Tab Pré-definidos */}
            {activeTab === 'predefined' && (
              <div className="space-y-6">
                {categories.filter(c => c !== 'Todos').map((category) => {
                  const categoryServices = beautyServices.filter(s => s.category === category);
                  if (categoryServices.length === 0) return null;

                  const config = categoryConfig[category] || { icon: '✨', gradient: 'from-gray-500 to-gray-600', color: 'bg-gray-500/20 text-gray-400' };

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`text-2xl p-2 rounded-lg bg-gradient-to-br ${config.gradient} bg-opacity-20`}>
                          {config.icon}
                        </div>
                        <h3 className="text-xl font-bold">{category}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {categoryServices.length} serviços
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryServices.map((service, idx) => {
                          // Verificar se o serviço já foi adicionado
                          const alreadyAdded = services.some(s => s.name === service.name && s.category === service.category);
                          
                          return (
                            <div
                              key={idx}
                              className={`group relative overflow-hidden rounded-lg border-2 ${
                                alreadyAdded 
                                  ? 'border-success/50 bg-success/5' 
                                  : 'border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/50'
                              } p-4 transition-all hover:shadow-lg`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{service.name}</h4>
                                  {service.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                                <div className="text-xs text-muted-foreground">
                                  {formatDuration(service.duration)} • R$ {service.price.toFixed(2).replace('.', ',')}
                                </div>
                                <Button
                                  size="sm"
                                  variant={alreadyAdded ? "outline" : "default"}
                                  disabled={alreadyAdded}
                                  onClick={async () => {
                                    await handleQuickAdd(service);
                                  }}
                                  className="text-xs"
                                >
                                  {alreadyAdded ? '✓ Adicionado' : '+ Adicionar'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Conteúdo da Tab Manual */}
            {activeTab === 'manual' && (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Corte de Cabelo, Manicure Completa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.filter(c => c !== 'Todos').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do serviço"
                />
              </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">Cadastrar Manualmente</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl glass-pink border-2 border-pink-600/40">
            <DialogHeader>
              <DialogTitle className="text-2xl">Editar Serviço</DialogTitle>
              <DialogDescription>Atualize as informações do serviço</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Serviço *</Label>
                <Input
                  id="edit-name"
                  placeholder="Ex: Corte de Cabelo, Manicure Completa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria *</Label>
                <select
                  id="edit-category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.filter(c => c !== 'Todos').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duração (minutos) *</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço (R$) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <textarea
                  id="edit-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do serviço"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditOpen(false);
                    setEditingService(null);
                    setFormData({
                      name: '',
                      description: '',
                      category: '',
                      duration: 60,
                      price: 0,
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Serviços */}
      {filteredServices.length === 0 ? (
        <Card className="border-2 border-dashed border-pink-600/40">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground text-lg">Nenhum serviço cadastrado ainda</p>
            <p className="text-muted-foreground text-sm mt-2">Clique em "+ Novo Serviço" para adicionar serviços</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServices.map((service) => {
            const config = categoryConfig[service.category] || { icon: '✨', gradient: 'from-gray-500 to-gray-600', color: 'bg-gray-500/20 text-gray-400' };
            return (
              <Card
                key={service.id}
                className="group relative overflow-hidden border-2 border-pink-600/40 hover:border-pink-600/60 transition-all"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-10 blur-2xl`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl p-3 rounded-lg bg-gradient-to-br ${config.gradient} bg-opacity-20`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Duração</div>
                      <div className="font-semibold">{formatDuration(service.duration)}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs text-muted-foreground">Preço</div>
                      <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(service)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={async () => {
                        if (confirm('Tem certeza que deseja deletar este serviço?')) {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`http://localhost:3001/services/${service.id}`, {
                              method: 'DELETE',
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            });
                            if (response.ok) {
                              loadServices();
                            }
                          } catch (error) {
                            alert('Erro ao deletar serviço');
                          }
                        }
                      }}
                    >
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
