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
  // CORS
  await server.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

