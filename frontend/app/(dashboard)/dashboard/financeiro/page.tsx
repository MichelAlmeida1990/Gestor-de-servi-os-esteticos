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
import { Pencil, Trash2, User, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string | null;
  paymentMethod: string | null;
  createdAt: string;
  professionalId: string | null;
  client: { name: string } | null;
  professional: { name: string } | null;
}

interface Professional {
  id: string;
  name: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  professionalEarnings?: number | null;
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    professionalEarnings: null,
  });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: 0,
    description: '',
    paymentMethod: '',
  });

  useEffect(() => {
    loadProfessionals();
    loadTransactions();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [selectedProfessionalId]);

  const loadProfessionals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/professionals', {
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
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = 'http://localhost:3001/transactions';
      if (selectedProfessionalId) {
        url += `?professionalId=${selectedProfessionalId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setSummary(data.summary || summary);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingTransaction ? 'PUT' : 'POST';
      const url = editingTransaction 
        ? `http://localhost:3001/transactions/${editingTransaction.id}`
        : 'http://localhost:3001/transactions';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      if (response.ok) {
        toast({
          title: editingTransaction ? 'Transação atualizada!' : 'Transação criada!',
          description: editingTransaction 
            ? 'A transação foi atualizada com sucesso.'
            : 'A transação foi criada com sucesso.',
          variant: 'success',
        });
        setOpen(false);
        setEditOpen(false);
        setEditingTransaction(null);
        setFormData({
          type: 'INCOME',
          amount: 0,
          description: '',
          paymentMethod: '',
        });
        loadTransactions();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || (editingTransaction ? 'Erro ao atualizar transação' : 'Erro ao criar transação'),
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || '',
      paymentMethod: transaction.paymentMethod || '',
    });
    setEditOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/transactions/${deletingTransaction.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: 'Transação deletada!',
          description: 'A transação foi removida com sucesso.',
          variant: 'success',
        });
        setDeleteOpen(false);
        setDeletingTransaction(null);
        loadTransactions();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao deletar transação',
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
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            {selectedProfessionalId
              ? `Ganhos de ${professionals.find(p => p.id === selectedProfessionalId)?.name || 'Profissional'}`
              : 'Controle suas receitas e despesas'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de Profissional */}
          <select
            value={selectedProfessionalId}
            onChange={(e) => setSelectedProfessionalId(e.target.value)}
            className="h-10 px-4 rounded-lg border-2 border-input bg-background text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">Todos os Profissionais</option>
            {professionals.filter(p => p.isActive !== false).map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadTransactions()}
            className="h-10 w-10"
            title="Atualizar histórico"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Nova Transação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
              <DialogDescription>Registre uma receita ou despesa</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                  required
                >
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <select
                  id="paymentMethod"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Registrar</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Transação</DialogTitle>
              <DialogDescription>Atualize os dados da transação</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo *</Label>
                <select
                  id="edit-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                  required
                >
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Valor (R$) *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">Forma de Pagamento</Label>
                <select
                  id="edit-paymentMethod"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  setEditOpen(false);
                  setEditingTransaction(null);
                  setFormData({
                    type: 'INCOME',
                    amount: 0,
                    description: '',
                    paymentMethod: '',
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
                Tem certeza que deseja deletar esta transação?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setDeleteOpen(false);
                setDeletingTransaction(null);
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
      </div>

      {/* Cards de Resumo */}
      <div className={`grid gap-4 ${selectedProfessionalId ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {selectedProfessionalId ? (
          <>
            <Card className="glass-card border-2 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Ganhos do Profissional
                </CardTitle>
                <span className="text-2xl">💼</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {(summary.professionalEarnings || 0).toFixed(2).replace('.', ',')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {professionals.find(p => p.id === selectedProfessionalId)?.name}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-2 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
                <span className="text-2xl">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {transactions.filter(t => t.type === 'INCOME').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Serviços realizados</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="glass-card border-2 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
                <span className="text-2xl">💰</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  R$ {summary.totalIncome.toFixed(2).replace('.', ',')}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
                <span className="text-2xl">💸</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  R$ {summary.totalExpense.toFixed(2).replace('.', ',')}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                <span className="text-2xl">💵</span>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  summary.balance >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  R$ {summary.balance.toFixed(2).replace('.', ',')}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Lista de Transações */}
      <Card className="glass-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            {selectedProfessionalId
              ? `Transações de ${professionals.find(p => p.id === selectedProfessionalId)?.name || 'Profissional'} - Total: ${transactions.length}`
              : `Total: ${transactions.length} transações`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {selectedProfessionalId
                ? 'Nenhuma transação encontrada para este profissional'
                : 'Nenhuma transação registrada ainda'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  {!selectedProfessionalId && <TableHead>Profissional</TableHead>}
                  <TableHead>Cliente</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        transaction.type === 'INCOME'
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                          : 'bg-red-500/20 text-red-500 border border-red-500/30'
                      }`}>
                        {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{transaction.description || '-'}</TableCell>
                    {!selectedProfessionalId && (
                      <TableCell>
                        {transaction.professional ? (
                          <span className="flex items-center gap-1 text-sm">
                            <User className="w-3 h-3" />
                            {transaction.professional.name}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {transaction.client ? (
                        <span className="text-sm">{transaction.client.name}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{transaction.paymentMethod || '-'}</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'} R$ {transaction.amount.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingTransaction(transaction);
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




