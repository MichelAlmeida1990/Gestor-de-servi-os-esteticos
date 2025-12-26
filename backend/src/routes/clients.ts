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
}




