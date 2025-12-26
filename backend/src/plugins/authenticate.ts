import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authenticatePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Não autorizado' });
    }
  });
};

export default fp(authenticatePlugin, {
  name: 'authenticate',
});

