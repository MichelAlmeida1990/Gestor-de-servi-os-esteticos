import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createAppointmentSchema = z.object({
  clientId: z.string(),
  serviceId: z.string(),
  professionalId: z.string().optional().nullable(),
  startTime: z.string(),
  notes: z.string().optional().nullable(),
});

const updateAppointmentSchema = z.object({
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
  professionalId: z.string().optional().nullable(),
  startTime: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional().nullable(),
});

export async function appointmentRoutes(fastify: FastifyInstance) {
  // Listar agendamentos
  fastify.get('/appointments', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user.userId;
    const { startDate, endDate, professionalId, status } = request.query as {
      startDate?: string;
      endDate?: string;
      professionalId?: string;
      status?: string;
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
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        service: true,
        professional: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return reply.send({ appointments });
  });

  // Criar agendamento
  fastify.post('/appointments', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const body = createAppointmentSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      // Buscar serviço para obter duração
      const service = await prisma.service.findUnique({
        where: { id: body.serviceId },
      });

      if (!service) {
        return reply.status(404).send({ error: 'Serviço não encontrado' });
      }

      const startTime = new Date(body.startTime);
      const endTime = new Date(startTime.getTime() + service.duration * 60000);

      // Verificar conflitos de horário
      if (body.professionalId) {
        const conflicting = await prisma.appointment.findFirst({
          where: {
            professionalId: body.professionalId,
            establishmentId: user.establishments[0].id,
            status: {
              notIn: ['CANCELLED', 'NO_SHOW'],
            },
            OR: [
              {
                startTime: { lte: startTime },
                endTime: { gt: startTime },
              },
              {
                startTime: { lt: endTime },
                endTime: { gte: endTime },
              },
              {
                startTime: { gte: startTime },
                endTime: { lte: endTime },
              },
            ],
          },
        });

        if (conflicting) {
          return reply.status(400).send({
            error: 'Horário já ocupado para este profissional',
          });
        }
      }

      const appointment = await prisma.appointment.create({
        data: {
          clientId: body.clientId,
          serviceId: body.serviceId,
          professionalId: body.professionalId || null,
          startTime,
          endTime,
          notes: body.notes || null,
          price: service.price,
          establishmentId: user.establishments[0].id,
        },
        include: {
          client: true,
          service: true,
          professional: true,
        },
      });

      return reply.status(201).send({ appointment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao criar agendamento' });
    }
  });

  // Buscar agendamento por ID
  fastify.get('/appointments/:id', {
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

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
      include: {
        client: true,
        service: true,
        professional: true,
      },
    });

    if (!appointment) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' });
    }

    return reply.send({ appointment });
  });

  // Atualizar agendamento
  fastify.put('/appointments/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;
      const body = updateAppointmentSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
        include: {
          service: true,
          transaction: true,
        },
      });

      if (!existingAppointment) {
        return reply.status(404).send({ error: 'Agendamento não encontrado' });
      }

      const updateData: any = {};
      if (body.clientId) updateData.clientId = body.clientId;
      if (body.serviceId) updateData.serviceId = body.serviceId;
      if (body.professionalId !== undefined) updateData.professionalId = body.professionalId;
      if (body.status) updateData.status = body.status;
      if (body.notes !== undefined) updateData.notes = body.notes;

      if (body.startTime) {
        const service = body.serviceId
          ? await prisma.service.findUnique({ where: { id: body.serviceId } })
          : existingAppointment.service;

        if (service) {
          const startTime = new Date(body.startTime);
          const endTime = new Date(startTime.getTime() + service.duration * 60000);
          updateData.startTime = startTime;
          updateData.endTime = endTime;
        }
      }

      // Verificar se o status está mudando para COMPLETED e se já existe transação
      const wasCompleted = existingAppointment.status === 'COMPLETED';
      const willBeCompleted = body.status === 'COMPLETED';
      const shouldCreateTransaction = willBeCompleted && !wasCompleted && !existingAppointment.transaction;

      const appointment = await prisma.appointment.updateMany({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
        data: updateData,
      });

      if (appointment.count === 0) {
        return reply.status(404).send({ error: 'Agendamento não encontrado' });
      }

      const updatedAppointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          client: true,
          service: true,
          professional: true,
          transaction: true,
        },
      });

      // Criar transação automaticamente quando agendamento é concluído
      if (shouldCreateTransaction && updatedAppointment) {
        try {
          await prisma.transaction.create({
            data: {
              type: 'INCOME',
              amount: updatedAppointment.price || updatedAppointment.service.price,
              description: `Serviço: ${updatedAppointment.service.name} - Cliente: ${updatedAppointment.client.name}`,
              paymentMethod: null, // Pode ser atualizado depois
              appointmentId: updatedAppointment.id,
              clientId: updatedAppointment.clientId,
              professionalId: updatedAppointment.professionalId || null,
              establishmentId: user.establishments[0].id,
            },
          });
        } catch (error) {
          console.error('Erro ao criar transação automática:', error);
          // Não falha a atualização do agendamento se a transação falhar
        }
      }

      return reply.send({ appointment: updatedAppointment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao atualizar agendamento' });
    }
  });

  // Deletar agendamento
  fastify.delete('/appointments/:id', {
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

    const appointment = await prisma.appointment.deleteMany({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
    });

    if (appointment.count === 0) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' });
    }

    return reply.status(204).send();
  });
}




