import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().min(0),
  description: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  appointmentId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  professionalId: z.string().optional().nullable(),
});

const updateTransactionSchema = createTransactionSchema.partial();

export async function transactionRoutes(fastify: FastifyInstance) {
  // Listar transações
  fastify.get('/transactions', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user.userId;
    const { startDate, endDate, type, professionalId } = request.query as {
      startDate?: string;
      endDate?: string;
      type?: string;
      professionalId?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { establishments: true },
    });

    if (!user || !user.establishments[0]) {
      return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
    }

    const where: any = {
      establishmentId: user.establishments[0].id,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (type) {
      where.type = type;
    }

    if (professionalId) {
      where.professionalId = professionalId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        client: true,
        professional: true,
        appointment: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular totais
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular ganhos do profissional (se filtrado)
    let professionalEarnings = 0;
    if (professionalId) {
      professionalEarnings = transactions
        .filter((t) => t.type === 'INCOME' && t.professionalId === professionalId)
        .reduce((sum, t) => sum + t.amount, 0);
    }

    return reply.send({
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        professionalEarnings: professionalId ? professionalEarnings : null,
      },
    });
  });

  // Criar transação
  fastify.post('/transactions', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const body = createTransactionSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const transaction = await prisma.transaction.create({
        data: {
          type: body.type,
          amount: body.amount,
          description: body.description || null,
          paymentMethod: body.paymentMethod || null,
          appointmentId: body.appointmentId || null,
          clientId: body.clientId || null,
          professionalId: body.professionalId || null,
          establishmentId: user.establishments[0].id,
        },
        include: {
          client: true,
          professional: true,
          appointment: true,
        },
      });

      return reply.status(201).send({ transaction });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao criar transação' });
    }
  });

  // Atualizar transação
  fastify.put('/transactions/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;
      const body = updateTransactionSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const transaction = await prisma.transaction.updateMany({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
        data: {
          ...(body.type && { type: body.type }),
          ...(body.amount !== undefined && { amount: body.amount }),
          ...(body.description !== undefined && { description: body.description || null }),
          ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod || null }),
          ...(body.appointmentId !== undefined && { appointmentId: body.appointmentId || null }),
          ...(body.clientId !== undefined && { clientId: body.clientId || null }),
          ...(body.professionalId !== undefined && { professionalId: body.professionalId || null }),
        },
      });

      if (transaction.count === 0) {
        return reply.status(404).send({ error: 'Transação não encontrada' });
      }

      const updatedTransaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          client: true,
          professional: true,
          appointment: true,
        },
      });

      return reply.send({ transaction: updatedTransaction });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao atualizar transação' });
    }
  });

  // Deletar transação
  fastify.delete('/transactions/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { establishments: true },
    });

    if (!user || !user.establishments[0]) {
      return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
    }

    const transaction = await prisma.transaction.deleteMany({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
    });

    if (transaction.count === 0) {
      return reply.status(404).send({ error: 'Transação não encontrada' });
    }

    return reply.status(204).send();
  });
}




