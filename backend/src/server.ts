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
  // CORS - Configurar origem do frontend
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Remove espaços e barras no final
  frontendUrl = frontendUrl.trim().replace(/\/+$/, '');
  
  // Log para debug
  console.log('🔗 FRONTEND_URL configurada:', frontendUrl);
  
  // Configurar CORS - usar array de origens permitidas
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  
  await server.register(cors, {
    origin: allowedOrigins,
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

