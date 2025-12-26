import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário admin de exemplo
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@beautyflow.com' },
    update: {},
    create: {
      email: 'admin@beautyflow.com',
      password: hashedPassword,
      name: 'Admin BeautyFlow',
      role: 'OWNER',
      establishments: {
        create: {
          name: 'Salão BeautyFlow',
          phone: '(11) 99999-9999',
          email: 'contato@beautyflow.com',
        },
      },
    },
    include: {
      establishments: true,
    },
  });

  const establishment = user.establishments[0];

  // Serviços de Cabelo
  const servicosCabelo = [
    { name: 'Corte Feminino', duration: 60, price: 80.00, category: 'Cabelo' },
    { name: 'Corte Masculino', duration: 30, price: 40.00, category: 'Cabelo' },
    { name: 'Escova Progressiva', duration: 180, price: 250.00, category: 'Cabelo' },
    { name: 'Botox Capilar', duration: 120, price: 180.00, category: 'Cabelo' },
    { name: 'Coloração Completa', duration: 180, price: 200.00, category: 'Cabelo' },
    { name: 'Mechas', duration: 240, price: 350.00, category: 'Cabelo' },
    { name: 'Reflexo', duration: 150, price: 150.00, category: 'Cabelo' },
    { name: 'Hidratação', duration: 60, price: 80.00, category: 'Cabelo' },
    { name: 'Escova', duration: 30, price: 35.00, category: 'Cabelo' },
    { name: 'Penteado', duration: 60, price: 100.00, category: 'Cabelo' },
  ];

  // Serviços de Manicure
  const servicosManicure = [
    { name: 'Manicure Completa', duration: 60, price: 45.00, category: 'Manicure' },
    { name: 'Pedicure Completa', duration: 60, price: 50.00, category: 'Pedicure' },
    { name: 'Manicure + Pedicure', duration: 90, price: 80.00, category: 'Manicure' },
    { name: 'Esmaltação em Gel', duration: 90, price: 70.00, category: 'Manicure' },
    { name: 'Alongamento de Unhas', duration: 120, price: 120.00, category: 'Manicure' },
    { name: 'Manutenção de Unhas', duration: 90, price: 80.00, category: 'Manicure' },
    { name: 'Decoração de Unhas', duration: 30, price: 25.00, category: 'Manicure' },
    { name: 'Remoção de Esmaltação', duration: 20, price: 15.00, category: 'Manicure' },
  ];

  // Serviços de Estética
  const servicosEstetica = [
    { name: 'Limpeza de Pele', duration: 90, price: 120.00, category: 'Estética' },
    { name: 'Drenagem Linfática', duration: 60, price: 100.00, category: 'Estética' },
    { name: 'Massagem Relaxante', duration: 60, price: 90.00, category: 'Estética' },
    { name: 'Massagem Modeladora', duration: 60, price: 100.00, category: 'Estética' },
    { name: 'Tratamento Facial', duration: 60, price: 150.00, category: 'Estética' },
    { name: 'Peeling Facial', duration: 45, price: 130.00, category: 'Estética' },
    { name: 'Design de Sobrancelhas', duration: 30, price: 40.00, category: 'Estética' },
    { name: 'Micropigmentação', duration: 120, price: 400.00, category: 'Estética' },
    { name: 'Depilação Facial', duration: 30, price: 50.00, category: 'Depilação' },
    { name: 'Depilação Completa', duration: 90, price: 150.00, category: 'Depilação' },
  ];

  // Serviços de Maquiagem
  const servicosMaquiagem = [
    { name: 'Maquiagem Social', duration: 60, price: 80.00, category: 'Maquiagem' },
    { name: 'Maquiagem para Eventos', duration: 90, price: 150.00, category: 'Maquiagem' },
    { name: 'Maquiagem para Noivas', duration: 120, price: 300.00, category: 'Maquiagem' },
  ];

  const todosServicos = [
    ...servicosCabelo,
    ...servicosManicure,
    ...servicosEstetica,
    ...servicosMaquiagem,
  ];

  console.log(`📦 Criando ${todosServicos.length} serviços...`);

  for (const servico of todosServicos) {
    await prisma.service.create({
      data: {
        name: servico.name,
        duration: servico.duration,
        price: servico.price,
        category: servico.category,
        description: `Serviço profissional de ${servico.category.toLowerCase()}`,
        establishmentId: establishment.id,
      },
    }).catch(() => {
      // Ignora se já existir
    });
  }

  console.log('✅ Seed concluído!');
  console.log('👤 Usuário criado: admin@beautyflow.com / admin123');
  console.log(`📊 ${todosServicos.length} serviços criados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

