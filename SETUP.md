# 🚀 Setup do BeautyFlow

## 📋 Pré-requisitos

- Node.js 20+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

## 🔧 Configuração Inicial

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 2. Backend

```bash
cd backend
npm install
```

#### Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/beautyflow?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

#### Configurar banco de dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar migrations
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para visualizar dados
npm run prisma:studio
```

#### Iniciar servidor

```bash
npm run dev
```

O backend estará rodando em `http://localhost:3001`

## 📦 Estrutura do Projeto

```
app-web-agendamento/
├── frontend/              # Next.js App
│   ├── app/               # App Router
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários
│   └── ...
├── backend/               # Fastify API
│   ├── src/               # Código fonte
│   ├── prisma/            # Schema e migrations
│   └── ...
└── docs/                  # Documentação
```

## 🎨 Cores do BeautyFlow

- **Primária (Azul)**: #031f5f
- **Secundária (Azure)**: #00afee
- **Destaque (Rosa neon)**: #ca00ca
- **Atenção (Marrom)**: #c2af00
- **Sucesso (Verde amarelado)**: #ccff00
- **Background**: #000000

## 📚 Próximos Passos

1. ✅ Estrutura criada
2. ✅ Schema do banco configurado
3. ⏳ Implementar autenticação
4. ⏳ Criar dashboard
5. ⏳ Implementar CRUDs (Clientes, Profissionais, Serviços)
6. ⏳ Sistema de agendamento

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`
- Teste a conexão: `psql -U user -d beautyflow`

### Erro de porta em uso
- Altere a porta no `.env` (PORT=3002)
- Ou pare o processo que está usando a porta

### Erro de Prisma
- Execute `npm run prisma:generate`
- Verifique se o schema está correto
- Execute `npm run prisma:migrate` novamente

---

**BeautyFlow** - Sistema de gestão para salões de beleza 💅





