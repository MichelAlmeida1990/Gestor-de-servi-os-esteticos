import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  establishmentName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Registro
  fastify.post('/auth/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);

      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return reply.status(400).send({
          error: 'Email já cadastrado',
        });
      }

      // Hash da senha
      const hashedPassword = await hashPassword(body.password);

      // Criar usuário e estabelecimento
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phone: body.phone || null,
          establishments: {
            create: {
              name: body.establishmentName,
            },
          },
        },
        include: {
          establishments: true,
        },
      });

      // Gerar token JWT
      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.status(201).send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        establishment: user.establishments[0],
        token,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Tratamento específico para erros do Prisma
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; message: string };
        if (prismaError.code === 'P2002') {
          return reply.status(400).send({
            error: 'Email já cadastrado',
          });
        }
        if (prismaError.code === 'P1001') {
          return reply.status(500).send({
            error: 'Erro ao conectar com o banco de dados. Verifique se o banco está rodando.',
          });
        }
      }
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      
      return reply.status(500).send({
        error: 'Erro ao criar conta',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  // Login
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        include: {
          establishments: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          error: 'Email ou senha inválidos',
        });
      }

      // Verificar senha
      const isValidPassword = await comparePassword(body.password, user.password);

      if (!isValidPassword) {
        return reply.status(401).send({
          error: 'Email ou senha inválidos',
        });
      }

      // Gerar token JWT
      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        establishment: user.establishments[0] || null,
        token,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Tratamento específico para erros do Prisma
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; message: string };
        if (prismaError.code === 'P1001') {
          return reply.status(500).send({
            error: 'Erro ao conectar com o banco de dados. Verifique se o banco está rodando.',
          });
        }
        if (prismaError.code === 'P2002') {
          return reply.status(400).send({
            error: 'Email já cadastrado',
          });
        }
      }
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      
      // Log detalhado do erro para debug
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('Erro detalhado no login:', { errorMessage, errorStack, error });
      
      return reply.status(500).send({
        error: 'Erro ao fazer login',
        message: errorMessage,
      });
    }
  });

  // Verificar token (me)
  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        include: {
          establishments: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
        });
      }

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          establishments: user.establishments,
        },
        establishment: user.establishments[0] || null,
      });
    } catch (error) {
      console.error('Erro em /auth/me:', error);
      
      // Tratamento específico para erros do Prisma
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; message: string };
        if (prismaError.code === 'P1001') {
          return reply.status(500).send({
            error: 'Erro ao conectar com o banco de dados. Verifique se o banco está rodando.',
          });
        }
      }
      
      // Log detalhado do erro para debug
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('Erro detalhado em /auth/me:', { errorMessage, errorStack, error });
      
      return reply.status(500).send({
        error: 'Erro ao buscar usuário',
        message: errorMessage,
      });
    }
  });
}

