import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  category: z.string().min(1),
  duration: z.number().min(1),
  price: z.number().min(0),
});

const updateServiceSchema = createServiceSchema.partial();

export async function serviceRoutes(fastify: FastifyInstance) {
  // Listar serviços
  fastify.get('/services', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { establishments: true },
    });

    if (!user || !user.establishments[0]) {
      return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
    }

    const services = await prisma.service.findMany({
      where: {
        establishmentId: user.establishments[0].id,
      },
      include: {
        professionals: {
          include: {
            professional: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reply.send({ services });
  });

  // Criar serviço
  fastify.post('/services', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const body = createServiceSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const service = await prisma.service.create({
        data: {
          name: body.name,
          description: body.description || null,
          category: body.category,
          duration: body.duration,
          price: body.price,
          establishmentId: user.establishments[0].id,
        },
      });

      return reply.status(201).send({ service });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao criar serviço' });
    }
  });

  // Buscar serviço por ID
  fastify.get('/services/:id', {
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

    const service = await prisma.service.findFirst({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
      include: {
        professionals: {
          include: {
            professional: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!service) {
      return reply.status(404).send({ error: 'Serviço não encontrado' });
    }

    return reply.send({ service });
  });

  // Atualizar serviço
  fastify.put('/services/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;
      const body = updateServiceSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const service = await prisma.service.updateMany({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.description !== undefined && { description: body.description || null }),
          ...(body.category && { category: body.category }),
          ...(body.duration !== undefined && { duration: body.duration }),
          ...(body.price !== undefined && { price: body.price }),
        },
      });

      if (service.count === 0) {
        return reply.status(404).send({ error: 'Serviço não encontrado' });
      }

      const updatedService = await prisma.service.findUnique({
        where: { id },
      });

      return reply.send({ service: updatedService });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao atualizar serviço' });
    }
  });

  // Deletar serviço
  fastify.delete('/services/:id', {
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

    const service = await prisma.service.deleteMany({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
    });

    if (service.count === 0) {
      return reply.status(404).send({ error: 'Serviço não encontrado' });
    }

    return reply.status(204).send();
  });
}




