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
import { API_URL } from '@/lib/api';

interface Professional {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  specialty: string | null;
  commission: number;
  isActive: boolean;
  createdAt: string;
}

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | null>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    commission: 0,
  });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/professionals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.professionals || []);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingProfessional ? 'PUT' : 'POST';
      const url = editingProfessional 
        ? `${API_URL}/professionals/${editingProfessional.id}`
        : `${API_URL}/professionals`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          commission: Number(formData.commission),
        }),
      });

      if (response.ok) {
        toast({
          title: editingProfessional ? 'Profissional atualizado!' : 'Profissional criado!',
          description: editingProfessional 
            ? 'Os dados do profissional foram atualizados com sucesso.'
            : 'O profissional foi cadastrado com sucesso.',
          variant: 'success',
        });
        setOpen(false);
        setEditOpen(false);
        setEditingProfessional(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          specialty: '',
          commission: 0,
        });
        loadProfessionals();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || (editingProfessional ? 'Erro ao atualizar profissional' : 'Erro ao criar profissional'),
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

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email || '',
      phone: professional.phone,
      specialty: professional.specialty || '',
      commission: professional.commission,
    });
    setEditOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProfessional) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/professionals/${deletingProfessional.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: 'Profissional deletado!',
          description: 'O profissional foi removido com sucesso.',
          variant: 'success',
        });
        setDeleteOpen(false);
        setDeletingProfessional(null);
        loadProfessionals();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao deletar profissional',
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
          <h1 className="text-3xl font-bold">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie sua equipe</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Novo Profissional</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Profissional</DialogTitle>
              <DialogDescription>Cadastre um novo profissional no sistema</DialogDescription>
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
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  placeholder="Ex: Cabelo, Manicure, Estética"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Comissão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
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
              <DialogTitle>Editar Profissional</DialogTitle>
              <DialogDescription>Atualize os dados do profissional</DialogDescription>
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
                <Label htmlFor="edit-specialty">Especialidade</Label>
                <Input
                  id="edit-specialty"
                  placeholder="Ex: Cabelo, Manicure, Estética"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-commission">Comissão (%)</Label>
                <Input
                  id="edit-commission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  setEditOpen(false);
                  setEditingProfessional(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    specialty: '',
                    commission: 0,
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
                Tem certeza que deseja deletar o profissional <strong>{deletingProfessional?.name}</strong>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setDeleteOpen(false);
                setDeletingProfessional(null);
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
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>Total: {professionals.length} profissionais</CardDescription>
        </CardHeader>
        <CardContent>
          {professionals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum profissional cadastrado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">{professional.name}</TableCell>
                    <TableCell>{professional.phone}</TableCell>
                    <TableCell>{professional.email || '-'}</TableCell>
                    <TableCell>{professional.specialty || '-'}</TableCell>
                    <TableCell>{professional.commission}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        professional.isActive 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {professional.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(professional)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingProfessional(professional);
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

