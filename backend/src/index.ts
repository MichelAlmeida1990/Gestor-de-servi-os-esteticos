import buildServer from './server';
import { execSync } from 'child_process';

const start = async () => {
  try {
    const server = await buildServer();
    
    // Porta do ambiente ou padrão 3001 (desenvolvimento)
    const port = Number(process.env.PORT) || 3001;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`🚀 BeautyFlow API rodando em http://${host}:${port}`);
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
};

start();


