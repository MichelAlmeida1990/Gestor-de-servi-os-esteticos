# 🧪 Guia de Teste de Deploy - BeautyFlow

## 📋 Checklist Antes do Deploy

### ✅ 1. Verificar Arquivos Sensíveis

**NÃO fazer commit de:**
- [ ] `backend/.env` - Contém senhas e secrets
- [ ] `frontend/.env.local` - Variáveis de ambiente locais
- [ ] `node_modules/` - Dependências (já no .gitignore)
- [ ] `.next/` - Build do Next.js (já no .gitignore)
- [ ] `dist/` - Build do backend (já no .gitignore)
- [ ] Arquivos de log
- [ ] Arquivos temporários

### ✅ 2. Criar .gitignore (se não existir)

Verificar se existe `.gitignore` na raiz do projeto. Se não existir, criar com:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Prisma
backend/prisma/migrations/

# Docker
docker-compose.override.yml
```

### ✅ 3. Testar Build Local

#### Backend
```bash
cd backend
npm install
npm run build
npm start
# Verificar se inicia sem erros
```

#### Frontend
```bash
cd frontend
npm install
npm run build
npm start
# Verificar se build é bem-sucedido
```

### ✅ 4. Verificar Variáveis de Ambiente

**Backend precisa de:**
- `DATABASE_URL` - URL do PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT
- `PORT` - Porta do servidor (opcional, padrão 3001)
- `FRONTEND_URL` - URL do frontend (para CORS)

**Frontend precisa de:**
- `NEXT_PUBLIC_API_URL` - URL da API backend

### ✅ 5. Testar Funcionalidades Locais

- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard carrega
- [ ] Criar cliente funciona
- [ ] Criar serviço funciona
- [ ] Criar agendamento funciona
- [ ] Visualizar agenda funciona
- [ ] Financeiro funciona

---

## 🚀 Teste de Deploy no Render (Backend)

### Passo 1: Criar Conta no Render
1. Acesse: https://dashboard.render.com
2. Crie uma conta (ou faça login)
3. Conecte com GitHub

### Passo 2: Criar Banco PostgreSQL
1. Dashboard → "New +" → "PostgreSQL"
2. Nome: `beautyflow-db`
3. Database: `beautyflow`
4. Region: Escolha a mais próxima
5. **Copie a Internal Database URL**

### Passo 3: Criar Web Service (Backend)
1. Dashboard → "New +" → "Web Service"
2. Conecte o repositório GitHub
3. Configurações:
   - **Name**: `beautyflow-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou Paid)

### Passo 4: Variáveis de Ambiente
No painel do serviço, adicione:
```env
DATABASE_URL=postgresql://... (Internal URL do PostgreSQL)
JWT_SECRET=gerar-chave-forte-aqui
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app (atualizar depois)
```

### Passo 5: Executar Migrações
1. No painel do serviço, clique em "Shell"
2. Execute:
```bash
npx prisma migrate deploy
```

### Passo 6: Testar Backend
1. Acesse a URL do serviço (ex: `https://beautyflow-backend.onrender.com`)
2. Teste `/health` endpoint
3. Verifique logs para erros

---

## 🔵 Teste de Deploy no Vercel (Frontend)

### Passo 1: Criar Conta no Vercel
1. Acesse: https://vercel.com
2. Crie uma conta (ou faça login com GitHub)
3. Conecte com GitHub

### Passo 2: Criar Projeto
1. "Add New..." → "Project"
2. Importe o repositório
3. Configurações:
   - **Framework Preset**: Next.js (auto-detectado)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

### Passo 3: Variáveis de Ambiente
No painel do Vercel:
```env
NEXT_PUBLIC_API_URL=https://beautyflow-backend.onrender.com
```

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde build completar
3. Verifique se foi bem-sucedido

### Passo 5: Testar Frontend
1. Acesse a URL do Vercel
2. Teste todas as funcionalidades
3. Verifique console do navegador para erros

---

## ✅ Testes Pós-Deploy

### Funcionalidades Básicas
- [ ] Página inicial carrega
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard carrega dados
- [ ] Navegação funciona

### CRUDs
- [ ] Criar cliente
- [ ] Editar cliente
- [ ] Deletar cliente
- [ ] Criar serviço
- [ ] Editar serviço
- [ ] Deletar serviço
- [ ] Criar agendamento
- [ ] Editar agendamento
- [ ] Deletar agendamento

### Funcionalidades Avançadas
- [ ] Agenda filtra por profissional
- [ ] Confirmar agendamento
- [ ] Concluir agendamento (cria transação)
- [ ] Financeiro mostra ganhos por profissional
- [ ] Transações são criadas automaticamente

### Responsividade
- [ ] Mobile funciona bem
- [ ] Tablet funciona bem
- [ ] Desktop funciona bem
- [ ] Sidebar colapsa em mobile
- [ ] Formulários são responsivos

---

## 🐛 Troubleshooting

### Backend não inicia
- Verificar logs no Render
- Verificar se `DATABASE_URL` está correto
- Verificar se build foi bem-sucedido
- Verificar se `PORT` está sendo usado corretamente

### Frontend não encontra API
- Verificar se `NEXT_PUBLIC_API_URL` está configurado
- Verificar se variável começa com `NEXT_PUBLIC_`
- Fazer rebuild após adicionar variáveis
- Verificar CORS no backend

### Erro de conexão com banco
- Verificar se `DATABASE_URL` usa Internal URL
- Verificar se banco está rodando
- Testar conexão via Shell do Render

### CORS Error
- Verificar se `FRONTEND_URL` está correto no backend
- Verificar se URLs usam HTTPS
- Verificar se origem está permitida

---

## 📝 Próximos Passos Após Teste

1. ✅ Testar localmente primeiro
2. ✅ Fazer deploy do backend no Render
3. ✅ Fazer deploy do frontend no Vercel
4. ✅ Testar todas as funcionalidades
5. ✅ Fazer push para GitHub
6. ✅ Configurar CI/CD (opcional)

