import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10),
  birthDate: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
});

const updateClientSchema = createClientSchema.partial();

const createHistorySchema = z.object({
  type: z.enum(['NOTE', 'COMPLAINT', 'PRAISE', 'WARNING']),
  title: z.string().optional().nullable(),
  description: z.string().min(1),
});

const updateHistorySchema = createHistorySchema.partial();

export async function clientRoutes(fastify: FastifyInstance) {
  // Listar clientes
  fastify.get('/clients', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user.userId;
    
    // Buscar estabelecimento do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { establishments: true },
    });

    if (!user || !user.establishments[0]) {
      return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
    }

    const clients = await prisma.client.findMany({
      where: {
        establishmentId: user.establishments[0].id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reply.send({ clients });
  });

  // Criar cliente
  fastify.post('/clients', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const body = createClientSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const client = await prisma.client.create({
        data: {
          name: body.name,
          email: body.email || null,
          phone: body.phone,
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
          address: body.address || null,
          notes: body.notes || null,
          preferences: body.preferences || null,
          establishmentId: user.establishments[0].id,
        },
      });

      return reply.status(201).send({ client });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao criar cliente' });
    }
  });

  // Buscar cliente por ID
  fastify.get('/clients/:id', {
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

    const client = await prisma.client.findFirst({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return reply.status(404).send({ error: 'Cliente não encontrado' });
    }

    return reply.send({ client });
  });

  // Atualizar cliente
  fastify.put('/clients/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;
      const body = updateClientSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const client = await prisma.client.updateMany({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.email !== undefined && { email: body.email || null }),
          ...(body.phone && { phone: body.phone }),
          ...(body.birthDate !== undefined && {
            birthDate: body.birthDate ? new Date(body.birthDate) : null,
          }),
          ...(body.address !== undefined && { address: body.address || null }),
          ...(body.notes !== undefined && { notes: body.notes || null }),
          ...(body.preferences !== undefined && { preferences: body.preferences || null }),
        },
      });

      if (client.count === 0) {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }

      const updatedClient = await prisma.client.findUnique({
        where: { id },
      });

      return reply.send({ client: updatedClient });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao atualizar cliente' });
    }
  });

  // Deletar cliente
  fastify.delete('/clients/:id', {
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

    const client = await prisma.client.deleteMany({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
    });

    if (client.count === 0) {
      return reply.status(404).send({ error: 'Cliente não encontrado' });
    }

    return reply.status(204).send();
  });

  // ========== HISTÓRICO DO CLIENTE ==========

  // Listar histórico do cliente
  fastify.get('/clients/:id/history', {
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

    // Verificar se o cliente pertence ao estabelecimento
    const client = await prisma.client.findFirst({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
    });

    if (!client) {
      return reply.status(404).send({ error: 'Cliente não encontrado' });
    }

    const history = await prisma.clientHistory.findMany({
      where: {
        clientId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reply.send({ history });
  });

  // Adicionar entrada ao histórico
  fastify.post('/clients/:id/history', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;
      const body = createHistorySchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      // Verificar se o cliente pertence ao estabelecimento
      const client = await prisma.client.findFirst({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
      });

      if (!client) {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }

      const historyEntry = await prisma.clientHistory.create({
        data: {
          clientId: id,
          type: body.type,
          title: body.title || null,
          description: body.description,
          createdBy: userId,
        },
      });

      return reply.status(201).send({ history: historyEntry });
    } catch (error) {
      console.error('Erro ao criar histórico:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      
      // Tratamento específico para erros do Prisma
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; message: string };
        if (prismaError.code === 'P2003') {
          return reply.status(400).send({
            error: 'Cliente não encontrado',
          });
        }
        if (prismaError.code === 'P1001') {
          return reply.status(500).send({
            error: 'Erro ao conectar com o banco de dados',
          });
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return reply.status(500).send({ 
        error: 'Erro ao criar histórico',
        message: errorMessage,
      });
    }
  });

  // Atualizar entrada do histórico
  fastify.put('/clients/:id/history/:historyId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id, historyId } = request.params as { id: string; historyId: string };
      const userId = request.user.userId;
      const body = updateHistorySchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      // Verificar se o histórico pertence ao cliente e estabelecimento
      const historyEntry = await prisma.clientHistory.findFirst({
        where: {
          id: historyId,
          clientId: id,
          client: {
            establishmentId: user.establishments[0].id,
          },
        },
      });

      if (!historyEntry) {
        return reply.status(404).send({ error: 'Histórico não encontrado' });
      }

      const updated = await prisma.clientHistory.update({
        where: { id: historyId },
        data: {
          type: body.type,
          title: body.title,
          description: body.description,
        },
      });

      return reply.send({ history: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao atualizar histórico' });
    }
  });

  // Deletar entrada do histórico
  fastify.delete('/clients/:id/history/:historyId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id, historyId } = request.params as { id: string; historyId: string };
    const userId = request.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { establishments: true },
    });

    if (!user || !user.establishments[0]) {
      return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
    }

    // Verificar se o histórico pertence ao cliente e estabelecimento
    const historyEntry = await prisma.clientHistory.findFirst({
      where: {
        id: historyId,
        clientId: id,
        client: {
          establishmentId: user.establishments[0].id,
        },
      },
    });

    if (!historyEntry) {
      return reply.status(404).send({ error: 'Histórico não encontrado' });
    }

    await prisma.clientHistory.delete({
      where: { id: historyId },
    });

    return reply.status(204).send();
  });

  // Estatísticas do cliente
  fastify.get('/clients/:id/stats', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      // Verificar se o cliente pertence ao estabelecimento
      const client = await prisma.client.findFirst({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
      });

      if (!client) {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }

      // Buscar agendamentos completados
      const completedAppointments = await prisma.appointment.findMany({
        where: {
          clientId: id,
          status: 'COMPLETED',
        },
        include: {
          service: true,
          professional: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      });

      // Calcular estatísticas
      const totalAppointments = completedAppointments.length;
      const totalSpent = completedAppointments.reduce((sum, apt) => {
        return sum + (apt.price || apt.service.price);
      }, 0);

      // Serviços mais utilizados
      const serviceCounts: Record<string, { count: number; totalSpent: number; name: string }> = {};
      completedAppointments.forEach(apt => {
        const serviceName = apt.service.name;
        if (!serviceCounts[serviceName]) {
          serviceCounts[serviceName] = { count: 0, totalSpent: 0, name: serviceName };
        }
        serviceCounts[serviceName].count++;
        serviceCounts[serviceName].totalSpent += apt.price || apt.service.price;
      });

      const mostUsedServices = Object.values(serviceCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Profissionais mais utilizados
      const professionalCounts: Record<string, { count: number; name: string }> = {};
      completedAppointments.forEach(apt => {
        if (apt.professional) {
          const profName = apt.professional.name;
          if (!professionalCounts[profName]) {
            professionalCounts[profName] = { count: 0, name: profName };
          }
          professionalCounts[profName].count++;
        }
      });

      const mostUsedProfessionals = Object.values(professionalCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Última visita
      const lastVisit = completedAppointments.length > 0 
        ? completedAppointments[0].startTime 
        : null;

      // Primeira visita
      const firstVisit = completedAppointments.length > 0
        ? completedAppointments[completedAppointments.length - 1].startTime
        : null;

      // Frequência média (dias entre visitas)
      let avgDaysBetweenVisits = null;
      if (completedAppointments.length > 1) {
        const dates = completedAppointments.map(apt => apt.startTime).sort((a, b) => a.getTime() - b.getTime());
        const totalDays = dates.reduce((sum, date, index) => {
          if (index === 0) return 0;
          const daysDiff = (date.getTime() - dates[index - 1].getTime()) / (1000 * 60 * 60 * 24);
          return sum + daysDiff;
        }, 0);
        avgDaysBetweenVisits = Math.round(totalDays / (dates.length - 1));
      }

      return reply.send({
        stats: {
          totalAppointments,
          totalSpent,
          mostUsedServices,
          mostUsedProfessionals,
          lastVisit,
          firstVisit,
          avgDaysBetweenVisits,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return reply.status(500).send({ error: 'Erro ao buscar estatísticas do cliente' });
    }
  });
}





