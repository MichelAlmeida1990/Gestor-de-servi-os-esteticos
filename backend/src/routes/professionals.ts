import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createProfessionalSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10),
  specialty: z.string().optional().nullable(),
  commission: z.number().min(0).max(100).default(0),
});

const updateProfessionalSchema = createProfessionalSchema.partial();

export async function professionalRoutes(fastify: FastifyInstance) {
  // Listar profissionais
  fastify.get('/professionals', {
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

    const professionals = await prisma.professional.findMany({
      where: {
        establishmentId: user.establishments[0].id,
      },
      include: {
        workSchedules: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reply.send({ professionals });
  });

  // Criar profissional
  fastify.post('/professionals', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const body = createProfessionalSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const professional = await prisma.professional.create({
        data: {
          name: body.name,
          email: body.email || null,
          phone: body.phone,
          specialty: body.specialty || null,
          commission: body.commission,
          establishmentId: user.establishments[0].id,
        },
      });

      return reply.status(201).send({ professional });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao criar profissional' });
    }
  });

  // Buscar profissional por ID
  fastify.get('/professionals/:id', {
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

    const professional = await prisma.professional.findFirst({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
      include: {
        workSchedules: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!professional) {
      return reply.status(404).send({ error: 'Profissional não encontrado' });
    }

    return reply.send({ professional });
  });

  // Atualizar profissional
  fastify.put('/professionals/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;
      const body = updateProfessionalSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { establishments: true },
      });

      if (!user || !user.establishments[0]) {
        return reply.status(404).send({ error: 'Estabelecimento não encontrado' });
      }

      const professional = await prisma.professional.updateMany({
        where: {
          id,
          establishmentId: user.establishments[0].id,
        },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.email !== undefined && { email: body.email || null }),
          ...(body.phone && { phone: body.phone }),
          ...(body.specialty !== undefined && { specialty: body.specialty || null }),
          ...(body.commission !== undefined && { commission: body.commission }),
        },
      });

      if (professional.count === 0) {
        return reply.status(404).send({ error: 'Profissional não encontrado' });
      }

      const updatedProfessional = await prisma.professional.findUnique({
        where: { id },
      });

      return reply.send({ professional: updatedProfessional });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Erro ao atualizar profissional' });
    }
  });

  // Deletar profissional
  fastify.delete('/professionals/:id', {
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

    const professional = await prisma.professional.deleteMany({
      where: {
        id,
        establishmentId: user.establishments[0].id,
      },
    });

    if (professional.count === 0) {
      return reply.status(404).send({ error: 'Profissional não encontrado' });
    }

    return reply.status(204).send();
  });
}




