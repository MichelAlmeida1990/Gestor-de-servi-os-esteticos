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
  
  // Configurar CORS - permitir todas as origens do Vercel e localhost
  await server.register(cors, {
    origin: (origin, cb) => {
      // Permitir requisições sem origem (ex: Postman, curl, mobile apps)
      if (!origin) {
        return cb(null, true);
      }
      
      // Permitir localhost em desenvolvimento
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return cb(null, true);
      }
      
      // Permitir domínios do Vercel (qualquer subdomínio)
      if (origin.includes('.vercel.app') || origin.includes('vercel.app')) {
        return cb(null, true);
      }
      
      // Permitir a URL específica do frontend
      if (origin === frontendUrl || origin.startsWith(frontendUrl)) {
        return cb(null, true);
      }
      
      // Permitir por padrão (para desenvolvimento)
      return cb(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security - Configurar Helmet para não bloquear CORS
  await server.register(helmet, {
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  });

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

