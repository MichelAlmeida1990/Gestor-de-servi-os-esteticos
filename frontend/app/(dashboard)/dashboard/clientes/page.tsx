'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';
import { Pencil, Trash2, History, Plus, AlertCircle, MessageSquare, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  birthDate: string | null;
  createdAt: string;
  history?: ClientHistory[];
}

interface ClientHistory {
  id: string;
  type: 'NOTE' | 'COMPLAINT' | 'PRAISE' | 'WARNING' | 'APPOINTMENT';
  title: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  appointmentId?: string | null;
  serviceName?: string | null;
  professionalName?: string | null;
  servicePrice?: number | null;
  serviceDuration?: number | null;
}

interface ClientStats {
  totalAppointments: number;
  totalSpent: number;
  mostUsedServices: Array<{ name: string; count: number; totalSpent: number }>;
  mostUsedProfessionals: Array<{ name: string; count: number }>;
  lastVisit: string | null;
  firstVisit: string | null;
  avgDaysBetweenVisits: number | null;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
  });
  const [clientHistory, setClientHistory] = useState<ClientHistory[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [historyForm, setHistoryForm] = useState({
    type: 'NOTE' as 'NOTE' | 'COMPLAINT' | 'PRAISE' | 'WARNING',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingClient ? 'PUT' : 'POST';
      const url = editingClient 
        ? `${API_URL}/clients/${editingClient.id}`
        : `${API_URL}/clients`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingClient ? 'Cliente atualizado!' : 'Cliente criado!',
          description: editingClient 
            ? 'Os dados do cliente foram atualizados com sucesso.'
            : 'O cliente foi cadastrado com sucesso.',
          variant: 'success',
        });
        setOpen(false);
        setEditOpen(false);
        setEditingClient(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          birthDate: '',
          address: '',
          notes: '',
        });
        loadClients();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || (editingClient ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente'),
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

  const loadClientHistory = async (clientId: string) => {
    try {
      const token = localStorage.getItem('token');
      const [historyResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/clients/${clientId}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/clients/${clientId}/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setClientHistory(historyData.history || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setClientStats(statsData.stats || null);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clients/${editingClient.id}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(historyForm),
      });

      if (response.ok) {
        toast({
          title: 'Histórico adicionado!',
          description: 'A entrada foi adicionada ao histórico do cliente.',
          variant: 'success',
        });
        setHistoryForm({
          type: 'NOTE',
          title: '',
          description: '',
        });
        loadClientHistory(editingClient.id);
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao adicionar histórico',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar histórico',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone,
      birthDate: client.birthDate ? client.birthDate.split('T')[0] : '',
      address: '',
      notes: '',
    });
    setEditOpen(true);
    loadClientHistory(client.id);
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clients/${deletingClient.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: 'Cliente deletado!',
          description: 'O cliente foi removido com sucesso.',
          variant: 'success',
        });
        setDeleteOpen(false);
        setDeletingClient(null);
        loadClients();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao deletar cliente',
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

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>Cadastre um novo cliente no sistema</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Cliente - {editingClient?.name}</DialogTitle>
              <DialogDescription>Gerencie os dados e histórico do cliente</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="historico">
                  <History className="w-4 h-4 mr-2" />
                  Histórico
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dados" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-birthDate">Data de Nascimento</Label>
                <Input
                  id="edit-birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Endereço</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observações</Label>
                <Input
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => {
                      setEditOpen(false);
                      setEditingClient(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        birthDate: '',
                        address: '',
                        notes: '',
                      });
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">Salvar Alterações</Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="historico" className="space-y-4">
                {/* Estatísticas do Cliente */}
                {clientStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estatísticas do Cliente</CardTitle>
                      <CardDescription>Resumo de atendimentos e histórico</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="text-2xl font-bold text-primary">{clientStats.totalAppointments}</div>
                          <div className="text-sm text-muted-foreground">Total de Atendimentos</div>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="text-2xl font-bold text-green-600">
                            R$ {clientStats.totalSpent.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Gasto</div>
                        </div>
                        {clientStats.lastVisit && (
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="text-sm font-bold text-blue-600">
                              {new Date(clientStats.lastVisit).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-sm text-muted-foreground">Última Visita</div>
                          </div>
                        )}
                        {clientStats.avgDaysBetweenVisits && (
                          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="text-2xl font-bold text-purple-600">{clientStats.avgDaysBetweenVisits}</div>
                            <div className="text-sm text-muted-foreground">Dias entre Visitas</div>
                          </div>
                        )}
                      </div>
                      
                      {clientStats.mostUsedServices.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Serviços Mais Utilizados</h4>
                          <div className="space-y-2">
                            {clientStats.mostUsedServices.map((service, index) => (
                              <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/50">
                                <span className="text-sm">{service.name}</span>
                                <div className="flex gap-4 text-sm">
                                  <span className="text-muted-foreground">{service.count}x</span>
                                  <span className="font-semibold">R$ {service.totalSpent.toFixed(2).replace('.', ',')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {clientStats.mostUsedProfessionals.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Profissionais Mais Utilizados</h4>
                          <div className="space-y-2">
                            {clientStats.mostUsedProfessionals.map((prof, index) => (
                              <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/50">
                                <span className="text-sm">{prof.name}</span>
                                <span className="text-sm text-muted-foreground">{prof.count} atendimentos</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Formulário para adicionar histórico */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Adicionar ao Histórico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddHistory} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="history-type">Tipo</Label>
                        <select
                          id="history-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={historyForm.type}
                          onChange={(e) => setHistoryForm({ ...historyForm, type: e.target.value as any })}
                        >
                          <option value="NOTE">Anotação</option>
                          <option value="COMPLAINT">Reclamação</option>
                          <option value="PRAISE">Elogio</option>
                          <option value="WARNING">Aviso</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="history-title">Título (opcional)</Label>
                        <Input
                          id="history-title"
                          value={historyForm.title}
                          onChange={(e) => setHistoryForm({ ...historyForm, title: e.target.value })}
                          placeholder="Ex: Reclamação sobre atendimento"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="history-description">Descrição *</Label>
                        <textarea
                          id="history-description"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={historyForm.description}
                          onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })}
                          required
                          placeholder="Descreva a situação, reclamação, elogio ou observação..."
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar ao Histórico
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Lista de histórico */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Histórico do Cliente</CardTitle>
                    <CardDescription>
                      {clientHistory.length === 0 
                        ? 'Nenhuma entrada no histórico ainda' 
                        : `${clientHistory.length} ${clientHistory.length === 1 ? 'entrada' : 'entradas'} no histórico`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientHistory.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma entrada no histórico. Adicione uma acima para começar.
                        </p>
                      ) : (
                        clientHistory.map((entry) => {
                          const getTypeIcon = () => {
                            switch (entry.type) {
                              case 'COMPLAINT':
                                return <AlertCircle className="w-4 h-4 text-red-500" />;
                              case 'PRAISE':
                                return <ThumbsUp className="w-4 h-4 text-green-500" />;
                              case 'WARNING':
                                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
                              case 'APPOINTMENT':
                                return <History className="w-4 h-4 text-purple-500" />;
                              default:
                                return <MessageSquare className="w-4 h-4 text-blue-500" />;
                            }
                          };

                          const getTypeLabel = () => {
                            switch (entry.type) {
                              case 'COMPLAINT':
                                return 'Reclamação';
                              case 'PRAISE':
                                return 'Elogio';
                              case 'WARNING':
                                return 'Aviso';
                              case 'APPOINTMENT':
                                return 'Atendimento';
                              default:
                                return 'Anotação';
                            }
                          };

                          const getTypeColor = () => {
                            switch (entry.type) {
                              case 'COMPLAINT':
                                return 'border-red-500/30 bg-red-500/10';
                              case 'PRAISE':
                                return 'border-green-500/30 bg-green-500/10';
                              case 'WARNING':
                                return 'border-yellow-500/30 bg-yellow-500/10';
                              case 'APPOINTMENT':
                                return 'border-purple-500/30 bg-purple-500/10';
                              default:
                                return 'border-blue-500/30 bg-blue-500/10';
                            }
                          };

                          return (
                            <div
                              key={entry.id}
                              className={`p-4 rounded-lg border ${getTypeColor()}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                  {getTypeIcon()}
                                  <span className="font-semibold text-sm">{getTypeLabel()}</span>
                                  {entry.title && (
                                    <span className="text-sm text-muted-foreground">- {entry.title}</span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(entry.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              
                              {entry.type === 'APPOINTMENT' && (
                                <div className="mb-2 p-2 rounded bg-background/50 border border-border/50">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {entry.serviceName && (
                                      <div>
                                        <span className="text-muted-foreground">Serviço: </span>
                                        <span className="font-semibold">{entry.serviceName}</span>
                                      </div>
                                    )}
                                    {entry.professionalName && (
                                      <div>
                                        <span className="text-muted-foreground">Profissional: </span>
                                        <span className="font-semibold">{entry.professionalName}</span>
                                      </div>
                                    )}
                                    {entry.servicePrice && (
                                      <div>
                                        <span className="text-muted-foreground">Valor: </span>
                                        <span className="font-semibold text-green-600">
                                          R$ {entry.servicePrice.toFixed(2).replace('.', ',')}
                                        </span>
                                      </div>
                                    )}
                                    {entry.serviceDuration && (
                                      <div>
                                        <span className="text-muted-foreground">Duração: </span>
                                        <span className="font-semibold">{entry.serviceDuration} min</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <p className="text-sm text-foreground whitespace-pre-wrap">{entry.description}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja deletar o cliente <strong>{deletingClient?.name}</strong>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setDeleteOpen(false);
                setDeletingClient(null);
              }}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Deletar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Total: {clients.length} clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cliente cadastrado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>
                      {client.birthDate
                        ? new Date(client.birthDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(client)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingClient(client);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

