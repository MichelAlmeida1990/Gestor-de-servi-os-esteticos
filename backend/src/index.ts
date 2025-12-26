import buildServer from './server';
import { execSync } from 'child_process';

const start = async () => {
  try {
    // Executar migrações do Prisma automaticamente na primeira inicialização
    if (process.env.NODE_ENV === 'production' && process.env.AUTO_MIGRATE !== 'false') {
      try {
        console.log('🔄 Executando migrações do banco de dados...');
        execSync('npx prisma db push --accept-data-loss', { 
          stdio: 'inherit',
          cwd: process.cwd(),
        });
        console.log('✅ Migrações executadas com sucesso!');
      } catch (migrateError) {
        console.warn('⚠️ Aviso: Erro ao executar migrações automáticas:', migrateError);
        console.warn('⚠️ Execute manualmente: npx prisma db push');
      }
    }

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


