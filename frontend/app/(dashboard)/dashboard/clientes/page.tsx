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
import { Pencil, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  birthDate: string | null;
  createdAt: string;
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

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/clients', {
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
        ? `http://localhost:3001/clients/${editingClient.id}`
        : 'http://localhost:3001/clients';
      
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
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/clients/${deletingClient.id}`, {
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>Atualize os dados do cliente</DialogDescription>
            </DialogHeader>
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

