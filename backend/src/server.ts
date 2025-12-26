import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth';
import { clientRoutes } from './routes/clients';
import { professionalRoutes } from './routes/professionals';
import { serviceRoutes } from './routes/services';
import { appointmentRoutes } from './routes/appointments';
import { transactionRoutes } from './routes/transactions';
import authenticatePlugin from './plugins/authenticate';

const server = Fastify({
  logger: true,
});

// Registro de plugins
async function buildServer() {
  // CORS - Extrair apenas o domínio da URL
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Remove espaços e barras no final
  frontendUrl = frontendUrl.trim().replace(/\/+$/, '');
  
  // Se for uma URL completa (começa com http:// ou https://), extrair apenas o domínio
  // O @fastify/cors aceita URLs completas, mas vamos garantir que está correto
  const corsOrigin = frontendUrl.startsWith('http://') || frontendUrl.startsWith('https://')
    ? frontendUrl
    : `https://${frontendUrl}`;
  
  // Log para debug
  console.log('🔗 FRONTEND_URL configurada:', corsOrigin);
  
  await server.register(cors, {
    origin: corsOrigin,
    credentials: true,
  });

  // Security
  await server.register(helmet);

  // JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'beautyflow-secret-key',
  });

  // Authenticate plugin
  await server.register(authenticatePlugin);

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', service: 'BeautyFlow API' };
  });

  // Rotas
  await server.register(authRoutes);
  await server.register(clientRoutes);
  await server.register(professionalRoutes);
  await server.register(serviceRoutes);
  await server.register(appointmentRoutes);
  await server.register(transactionRoutes);

  return server;
}

export default buildServer;

