# 🚀 Guia de Deploy - BeautyFlow

## 📋 Visão Geral

- **Frontend (Next.js)**: Vercel
- **Backend (Fastify)**: Render
- **Banco de Dados (PostgreSQL)**: Render PostgreSQL

---

## 🟢 PARTE 1: Deploy do Backend no Render

### 1.1 Preparar o Backend

#### Criar `Dockerfile` (Opcional, mas recomendado)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando de start
CMD ["npm", "start"]
```

#### Criar `.dockerignore`

```
# backend/.dockerignore
node_modules
dist
.env
.env.local
*.log
.DS_Store
```

### 1.2 Criar Serviço no Render

1. **Acesse**: https://dashboard.render.com
2. **Crie uma conta** (ou faça login)
3. **Clique em "New +"** → **"Web Service"**
4. **Conecte seu repositório** (GitHub/GitLab)
5. **Configure o serviço**:
   - **Name**: `beautyflow-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend` (se o repositório for a raiz do projeto)

### 1.3 Variáveis de Ambiente no Render

No painel do Render, vá em **"Environment"** e adicione:

```env
# Banco de Dados (será criado depois)
DATABASE_URL=postgresql://user:password@host:5432/beautyflow?schema=public

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-gerar-aleatorio

# Porta (Render define automaticamente, mas pode forçar)
PORT=3001
HOST=0.0.0.0

# Ambiente
NODE_ENV=production

# Frontend URL (será atualizado depois do deploy do frontend)
FRONTEND_URL=https://seu-app.vercel.app
```

### 1.4 Criar Banco PostgreSQL no Render

1. **No Render Dashboard**: Clique em **"New +"** → **"PostgreSQL"**
2. **Configure**:
   - **Name**: `beautyflow-db`
   - **Database**: `beautyflow`
   - **User**: (gerado automaticamente)
   - **Region**: Escolha a mais próxima (ex: `Oregon (US West)`)
3. **Copie a Internal Database URL** e cole em `DATABASE_URL` no serviço web
4. **Aguarde o banco ser criado** (1-2 minutos)

### 1.5 Executar Migrações

Após o primeiro deploy, execute as migrações:

**Opção 1: Via Render Shell**
1. No painel do serviço, clique em **"Shell"**
2. Execute:
```bash
cd backend
npm run prisma:migrate deploy
```

**Opção 2: Adicionar ao Build Command**
```bash
cd backend && npm install && npm run build && npx prisma migrate deploy
```

### 1.6 URL do Backend

Após o deploy, você terá uma URL como:
```
https://beautyflow-backend.onrender.com
```

**⚠️ IMPORTANTE**: Render coloca serviços gratuitos em "sleep" após 15min de inatividade. Para evitar isso:
- Use o plano pago ($7/mês)
- Ou configure um "health check" ping externo

---

## 🔵 PARTE 2: Deploy do Frontend no Vercel

### 2.1 Preparar o Frontend

#### Criar `vercel.json` (Opcional)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"]
}
```

### 2.2 Criar Projeto no Vercel

1. **Acesse**: https://vercel.com
2. **Crie uma conta** (ou faça login com GitHub)
3. **Clique em "Add New..."** → **"Project"**
4. **Importe seu repositório** (GitHub/GitLab)
5. **Configure o projeto**:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `frontend` (se o repositório for a raiz)
   - **Build Command**: `npm run build` (ou deixe padrão)
   - **Output Directory**: `.next` (padrão)

### 2.3 Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **"Settings"** → **"Environment Variables"** e adicione:

```env
# URL do Backend (Render)
NEXT_PUBLIC_API_URL=https://beautyflow-backend.onrender.com
```

### 2.4 Atualizar Frontend para Usar Variável de Ambiente

Criar arquivo de configuração:

```typescript
// frontend/lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

E atualizar todas as chamadas de API no frontend para usar `API_URL`:

```typescript
// Exemplo: frontend/app/(auth)/login/page.tsx
const response = await fetch(`${API_URL}/auth/login`, {
  // ...
});
```

### 2.5 URL do Frontend

Após o deploy, você terá uma URL como:
```
https://beautyflow.vercel.app
```

---

## 🔄 PARTE 3: Atualizar URLs e Configurações

### 3.1 Atualizar Backend com URL do Frontend

No Render, atualize a variável de ambiente:
```env
FRONTEND_URL=https://beautyflow.vercel.app
```

### 3.2 Atualizar Frontend com URL do Backend

No Vercel, certifique-se de que:
```env
NEXT_PUBLIC_API_URL=https://beautyflow-backend.onrender.com
```

### 3.3 Atualizar Código do Frontend

Substituir todas as URLs hardcoded:

**Antes:**
```typescript
fetch('http://localhost:3001/auth/login', ...)
```

**Depois:**
```typescript
import { API_URL } from '@/lib/api';
fetch(`${API_URL}/auth/login`, ...)
```

---

## 📝 PARTE 4: Checklist de Deploy

### Backend (Render)
- [ ] Repositório conectado
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Variáveis de ambiente configuradas:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL`
- [ ] Banco PostgreSQL criado
- [ ] Migrações executadas
- [ ] Serviço rodando e acessível

### Frontend (Vercel)
- [ ] Repositório conectado
- [ ] Framework detectado (Next.js)
- [ ] Variáveis de ambiente configuradas:
  - [ ] `NEXT_PUBLIC_API_URL`
- [ ] Build bem-sucedido
- [ ] Deploy concluído
- [ ] Site acessível

### Pós-Deploy
- [ ] Testar login/registro
- [ ] Testar criação de dados
- [ ] Verificar CORS (backend deve aceitar origem do Vercel)
- [ ] Verificar HTTPS (ambos devem usar HTTPS)
- [ ] Testar em diferentes navegadores

---

## 🐛 Troubleshooting

### Backend não inicia no Render
- Verifique os logs no painel do Render
- Confirme que `PORT` está usando `process.env.PORT` (Render define automaticamente)
- Verifique se o build está completo

### Erro de conexão com banco
- Confirme que `DATABASE_URL` está usando a **Internal Database URL** do Render
- Verifique se o banco está rodando
- Teste a conexão via Shell do Render

### CORS Error no Frontend
- No backend, certifique-se que `FRONTEND_URL` está correto
- Verifique se está usando HTTPS em produção

### Frontend não encontra API
- Confirme que `NEXT_PUBLIC_API_URL` está configurado no Vercel
- Verifique se a variável começa com `NEXT_PUBLIC_` (necessário para expor ao cliente)
- Faça rebuild após adicionar variáveis

### Render coloca serviço em sleep
- Serviços gratuitos entram em sleep após 15min
- Primeira requisição após sleep pode demorar ~30s
- Solução: Plano pago ($7/mês) ou health check externo

---

## 💰 Custos Estimados

### Render (Backend + PostgreSQL)
- **Plano Gratuito**: 
  - Backend: Sleep após 15min
  - PostgreSQL: 90 dias grátis, depois $7/mês
- **Plano Pago**: $7/mês (backend) + $7/mês (PostgreSQL) = **$14/mês**

### Vercel (Frontend)
- **Plano Gratuito**: 
  - 100GB bandwidth/mês
  - Deploys ilimitados
  - **GRÁTIS para projetos pessoais**

### Total Estimado
- **Gratuito**: $0/mês (com limitações)
- **Pago**: ~$14/mês (sem limitações)

---

## 🔐 Segurança em Produção

### Antes de fazer deploy, certifique-se:

1. **JWT_SECRET** forte e único
2. **DATABASE_URL** usando Internal URL (não exposta)
3. **HTTPS** habilitado (automático no Vercel e Render)
4. **CORS** configurado corretamente
5. **Variáveis sensíveis** apenas no painel (não no código)

---

## 📚 Recursos Úteis

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deploy**: https://nextjs.org/docs/deployment

---

## ✅ Próximos Passos

1. Fazer deploy do backend no Render
2. Criar banco PostgreSQL no Render
3. Fazer deploy do frontend no Vercel
4. Atualizar URLs e variáveis de ambiente
5. Testar todas as funcionalidades
6. Configurar domínio customizado (opcional)

