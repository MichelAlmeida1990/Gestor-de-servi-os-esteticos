# ✅ Checklist de Deploy - BeautyFlow

## 📋 Pré-Deploy

### Backend
- [x] Criado `Dockerfile` para Render
- [x] Criado `.dockerignore`
- [x] Atualizado `index.ts` para usar `process.env.PORT`
- [ ] Testar build local: `cd backend && npm run build`
- [ ] Verificar se todas as dependências estão em `package.json`

### Frontend
- [x] Criado `lib/api.ts` com configuração de API_URL
- [x] Atualizado `login/page.tsx` para usar API_URL
- [x] Atualizado `register/page.tsx` para usar API_URL
- [x] Atualizado `layout.tsx` para usar API_URL
- [ ] Atualizar TODAS as páginas do dashboard para usar API_URL
- [x] Criado `vercel.json`
- [ ] Testar build local: `cd frontend && npm run build`

---

## 🟢 Deploy Backend (Render)

### 1. Criar Conta e Repositório
- [ ] Criar conta no Render: https://dashboard.render.com
- [ ] Conectar repositório GitHub/GitLab
- [ ] Verificar se o código está no repositório

### 2. Criar Banco PostgreSQL
- [ ] Render Dashboard → "New +" → "PostgreSQL"
- [ ] Nome: `beautyflow-db`
- [ ] Database: `beautyflow`
- [ ] Region: Escolher mais próxima
- [ ] Copiar **Internal Database URL**

### 3. Criar Web Service (Backend)
- [ ] Render Dashboard → "New +" → "Web Service"
- [ ] Conectar repositório
- [ ] Configurações:
  - **Name**: `beautyflow-backend`
  - **Environment**: `Node`
  - **Root Directory**: `backend` (se repo na raiz)
  - **Build Command**: `npm install && npm run build && npx prisma generate`
  - **Start Command**: `npm start`
  - **Plan**: Free (ou Paid para evitar sleep)

### 4. Variáveis de Ambiente (Backend)
- [ ] `DATABASE_URL` = Internal Database URL do PostgreSQL
- [ ] `JWT_SECRET` = Gerar chave forte (ex: `openssl rand -base64 32`)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = (deixar vazio, Render define automaticamente)
- [ ] `HOST` = `0.0.0.0`
- [ ] `FRONTEND_URL` = (atualizar depois do deploy do frontend)

### 5. Executar Migrações
- [ ] Render Dashboard → Serviço → "Shell"
- [ ] Executar: `npx prisma migrate deploy`
- [ ] Verificar se migrações foram aplicadas

### 6. Verificar Deploy
- [ ] Acessar URL do backend (ex: `https://beautyflow-backend.onrender.com`)
- [ ] Testar `/health` endpoint
- [ ] Verificar logs para erros

---

## 🔵 Deploy Frontend (Vercel)

### 1. Criar Conta e Projeto
- [ ] Criar conta no Vercel: https://vercel.com
- [ ] Conectar repositório GitHub/GitLab
- [ ] "Add New..." → "Project"
- [ ] Importar repositório

### 2. Configurar Projeto
- [ ] **Framework Preset**: Next.js (auto-detectado)
- [ ] **Root Directory**: `frontend` (se repo na raiz)
- [ ] **Build Command**: `npm run build` (padrão)
- [ ] **Output Directory**: `.next` (padrão)
- [ ] **Install Command**: `npm install` (padrão)

### 3. Variáveis de Ambiente (Frontend)
- [ ] Settings → Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` = URL do backend Render
  - Exemplo: `https://beautyflow-backend.onrender.com`

### 4. Deploy
- [ ] Clicar em "Deploy"
- [ ] Aguardar build completar
- [ ] Verificar se build foi bem-sucedido

### 5. Verificar Deploy
- [ ] Acessar URL do frontend (ex: `https://beautyflow.vercel.app`)
- [ ] Testar página inicial
- [ ] Verificar console do navegador para erros

---

## 🔄 Pós-Deploy

### 1. Atualizar URLs
- [ ] No Render (Backend): Atualizar `FRONTEND_URL` com URL do Vercel
- [ ] No Vercel (Frontend): Verificar se `NEXT_PUBLIC_API_URL` está correto

### 2. Testar Funcionalidades
- [ ] Testar registro de novo usuário
- [ ] Testar login
- [ ] Testar criação de cliente
- [ ] Testar criação de serviço
- [ ] Testar criação de agendamento
- [ ] Testar visualização de dados
- [ ] Testar edição de dados
- [ ] Testar exclusão de dados

### 3. Verificar Segurança
- [ ] HTTPS habilitado (automático)
- [ ] CORS configurado corretamente
- [ ] Variáveis sensíveis não expostas
- [ ] JWT_SECRET forte e único

### 4. Monitoramento
- [ ] Configurar alertas no Render (se plano pago)
- [ ] Verificar logs regularmente
- [ ] Monitorar uso de recursos

---

## 🐛 Troubleshooting

### Backend não inicia
- [ ] Verificar logs no Render
- [ ] Verificar se `PORT` está sendo usado corretamente
- [ ] Verificar se build foi bem-sucedido

### Erro de conexão com banco
- [ ] Verificar se `DATABASE_URL` está usando Internal URL
- [ ] Verificar se banco está rodando
- [ ] Testar conexão via Shell do Render

### CORS Error
- [ ] Verificar se `FRONTEND_URL` está correto no backend
- [ ] Verificar se URLs usam HTTPS

### Frontend não encontra API
- [ ] Verificar se `NEXT_PUBLIC_API_URL` está configurado
- [ ] Verificar se variável começa com `NEXT_PUBLIC_`
- [ ] Fazer rebuild após adicionar variáveis

### Render em sleep
- [ ] Primeira requisição pode demorar ~30s
- [ ] Considerar plano pago ($7/mês) para evitar sleep

---

## 📝 Notas

- **Render Free**: Serviços entram em sleep após 15min de inatividade
- **Vercel Free**: 100GB bandwidth/mês, suficiente para começar
- **PostgreSQL Free**: 90 dias grátis no Render, depois $7/mês
- **Total**: ~$0-14/mês dependendo do plano

---

## ✅ Próximos Passos Após Deploy

1. Configurar domínio customizado (opcional)
2. Configurar CI/CD (deploy automático)
3. Implementar melhorias de segurança
4. Configurar backup do banco de dados
5. Monitorar performance e uso





