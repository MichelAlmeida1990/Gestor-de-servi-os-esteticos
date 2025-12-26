# 🚀 Guia Completo de Deploy Gratuito - BeautyFlow

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Deploy do Backend no Render](#deploy-do-backend-no-render)
3. [Deploy do Frontend no Vercel](#deploy-do-frontend-no-vercel)
4. [Configuração Final](#configuração-final)
5. [Troubleshooting](#troubleshooting)

---

## 📦 Pré-requisitos

### Contas Necessárias (Todas Gratuitas)
- ✅ Conta no GitHub (já temos o repositório)
- ✅ Conta no Render (para backend + banco de dados)
- ✅ Conta no Vercel (para frontend)

### Links para Criar Contas
- **Render**: https://dashboard.render.com (conectar com GitHub)
- **Vercel**: https://vercel.com (conectar com GitHub)

---

## 🗄️ PARTE 1: Deploy do Backend no Render

### Passo 1.1: Criar Conta no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"Get Started for Free"** ou **"Sign Up"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar seus repositórios
5. Complete o cadastro

### Passo 1.2: Criar Banco de Dados PostgreSQL (GRATUITO)

1. No dashboard do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"PostgreSQL"**
3. Preencha os campos:
   - **Name**: `beautyflow-db`
   - **Database**: `beautyflow` (ou deixe o padrão)
   - **User**: `beautyflow_user` (ou deixe o padrão)
   - **Region**: Escolha a mais próxima (ex: `Oregon (US West)` ou `Frankfurt (EU)` para Brasil)
   - **PostgreSQL Version**: `16` (ou a mais recente)
   - **Plan**: **Free** ✅
4. Clique em **"Create Database"**
5. ⏳ Aguarde 2-3 minutos para o banco ser criado

### Passo 1.3: Copiar URL do Banco de Dados

1. Após o banco ser criado, clique nele para abrir os detalhes
2. Na seção **"Connections"**, você verá:
   - **Internal Database URL**: `postgresql://user:password@hostname:5432/dbname`
   - **External Database URL**: (para conexões de fora do Render)
3. **COPIE a Internal Database URL** (vamos usar esta)
4. ⚠️ **IMPORTANTE**: Guarde esta URL, você precisará dela depois!

### Passo 1.4: Criar Web Service (Backend)

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório GitHub:
   - Se ainda não conectou, clique em **"Connect account"**
   - Autorize o acesso
   - Selecione o repositório: `MichelAlmeida1990/Gestor-de-servi-os-esteticos`
4. Preencha as configurações:

#### Configurações Básicas:
- **Name**: `beautyflow-backend`
- **Region**: Mesma região do banco de dados
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANTE**
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install && npm run build && npx prisma generate
  ```
- **Start Command**: 
  ```bash
  npm start
  ```
- **Plan**: **Free** ✅

#### Variáveis de Ambiente:
Clique em **"Advanced"** → **"Add Environment Variable"** e adicione:

```
DATABASE_URL = [Cole a Internal Database URL que você copiou no Passo 1.3]
```

```
JWT_SECRET = beautyflow-super-secret-jwt-key-change-in-production-2025
```
⚠️ **IMPORTANTE**: Gere uma chave aleatória forte para produção! Use: https://randomkeygen.com/

```
NODE_ENV = production
```

```
FRONTEND_URL = https://seu-app.vercel.app
```
⚠️ **ATENÇÃO**: Substitua `seu-app.vercel.app` pela URL real do Vercel (vamos configurar depois)

```
PORT = 3001
```

5. Clique em **"Create Web Service"**
6. ⏳ Aguarde 5-10 minutos para o build inicial

### Passo 1.5: Executar Migrações do Prisma

Após o serviço estar rodando:

1. No painel do serviço, clique na aba **"Shell"** (no menu lateral)
2. Aguarde o shell abrir
3. Execute os comandos:

```bash
cd backend
npx prisma migrate deploy
```

4. Se aparecer erro, tente:
```bash
npx prisma db push
```

5. ✅ Se aparecer "All migrations have been applied", está tudo certo!

### Passo 1.6: Testar o Backend

1. No painel do serviço, copie a **URL** (ex: `https://beautyflow-backend.onrender.com`)
2. Teste no navegador: `https://sua-url.onrender.com/health`
3. ✅ Deve retornar: `{"status":"ok","service":"BeautyFlow API"}`

### Passo 1.7: Verificar Logs

1. No painel do serviço, clique em **"Logs"**
2. Verifique se não há erros
3. Se houver erros, verifique:
   - Se `DATABASE_URL` está correto
   - Se as migrações foram executadas
   - Se o build foi bem-sucedido

---

## 🎨 PARTE 2: Deploy do Frontend no Vercel

### Passo 2.1: Criar Conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios
5. Complete o cadastro

### Passo 2.2: Criar Novo Projeto

1. No dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Selecione o repositório: `MichelAlmeida1990/Gestor-de-servi-os-esteticos`
4. Clique em **"Import"**

### Passo 2.3: Configurar o Projeto

#### Configurações do Projeto:
- **Project Name**: `beautyflow-frontend` (ou deixe o padrão)
- **Framework Preset**: `Next.js` (deve detectar automaticamente)
- **Root Directory**: `frontend` ⚠️ **IMPORTANTE**
- **Build Command**: `npm run build` (padrão)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install` (padrão)

#### Variáveis de Ambiente:
Antes de fazer deploy, adicione as variáveis:

1. Clique em **"Environment Variables"**
2. Adicione:

```
NEXT_PUBLIC_API_URL = https://beautyflow-backend.onrender.com
```
⚠️ **IMPORTANTE**: Substitua pela URL real do seu backend no Render!

3. Clique em **"Add"** para cada variável

### Passo 2.4: Fazer Deploy

1. Clique em **"Deploy"**
2. ⏳ Aguarde 2-5 minutos para o build
3. ✅ Quando terminar, você verá a URL do seu app (ex: `https://beautyflow-frontend.vercel.app`)

### Passo 2.5: Atualizar FRONTEND_URL no Render

1. Volte ao Render (backend)
2. Vá em **"Environment"** → **"Environment Variables"**
3. Edite a variável `FRONTEND_URL`
4. Cole a URL do Vercel (ex: `https://beautyflow-frontend.vercel.app`)
5. Clique em **"Save Changes"**
6. O serviço será reiniciado automaticamente

### Passo 2.6: Testar o Frontend

1. Acesse a URL do Vercel
2. Teste:
   - ✅ Página inicial carrega
   - ✅ Botão de registro funciona
   - ✅ Login funciona
   - ✅ Dashboard carrega após login

---

## 🔗 PARTE 3: Configuração Final

### Passo 3.1: Verificar CORS

1. No Render (backend), verifique se `FRONTEND_URL` está correto
2. Teste fazer login no frontend
3. Se der erro de CORS, verifique:
   - URL do frontend no `FRONTEND_URL`
   - Se a URL começa com `https://`
   - Se não tem barra `/` no final

### Passo 3.2: Testar Funcionalidades

Teste todas as funcionalidades:
- [ ] Registro de usuário
- [ ] Login
- [ ] Dashboard carrega dados
- [ ] Criar cliente
- [ ] Criar serviço
- [ ] Criar agendamento
- [ ] Visualizar agenda
- [ ] Financeiro funciona

### Passo 3.3: URLs Finais

Anote suas URLs:
- **Backend**: `https://beautyflow-backend.onrender.com`
- **Frontend**: `https://beautyflow-frontend.vercel.app`
- **Banco de Dados**: (Internal URL no Render)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se `DATABASE_URL` está correto no Render
2. Use a **Internal Database URL** (não a External)
3. Verifique se o banco está rodando (status "Available")

### Erro: "CORS Error"

**Solução:**
1. Verifique `FRONTEND_URL` no Render
2. Certifique-se que começa com `https://`
3. Sem barra `/` no final
4. Reinicie o serviço no Render

### Erro: "Prisma Client not generated"

**Solução:**
1. No Shell do Render, execute:
```bash
cd backend
npx prisma generate
```

### Erro: "Build failed" no Vercel

**Solução:**
1. Verifique os logs de build na Vercel
2. Verifique se `NEXT_PUBLIC_API_URL` está configurado
3. Verifique se o root directory está como `frontend`
4. Limpe o cache: Settings → Clear Build Cache

### Backend não inicia

**Solução:**
1. Verifique os logs no Render
2. Verifique se `PORT` está sendo usado corretamente
3. Verifique se `DATABASE_URL` está correto
4. Verifique se as migrações foram executadas

### Frontend não encontra API

**Solução:**
1. Verifique se `NEXT_PUBLIC_API_URL` está configurado na Vercel
2. Verifique se a variável começa com `NEXT_PUBLIC_`
3. Faça um novo deploy após adicionar variáveis
4. Verifique o console do navegador para erros

---

## 📝 Checklist Final

### Backend (Render)
- [ ] Banco PostgreSQL criado
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas
- [ ] Endpoint `/health` funciona
- [ ] Logs sem erros

### Frontend (Vercel)
- [ ] Projeto criado
- [ ] Root directory: `frontend`
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy bem-sucedido
- [ ] Página inicial carrega
- [ ] Login funciona

### Integração
- [ ] `FRONTEND_URL` no Render aponta para Vercel
- [ ] CORS funcionando
- [ ] Todas as funcionalidades testadas
- [ ] URLs anotadas

---

## 🎉 Pronto!

Seu BeautyFlow está no ar! 🚀

**URLs:**
- Frontend: `https://seu-app.vercel.app`
- Backend: `https://seu-backend.onrender.com`

**Próximos passos:**
- Compartilhe a URL com seus usuários
- Monitore os logs regularmente
- Faça backups do banco de dados periodicamente

---

## 💡 Dicas Importantes

### Limitações do Plano Gratuito

**Render (Free):**
- ⚠️ Serviço "dorme" após 15 minutos de inatividade
- ⚠️ Primeira requisição após dormir pode demorar ~30 segundos
- ⚠️ Banco de dados limitado a 90 dias (depois precisa upgrade)

**Vercel (Free):**
- ✅ Sem limitações de "dormir"
- ✅ Builds ilimitados
- ✅ Bandwidth generoso

### Melhorias Futuras

Para produção real, considere:
- Upgrade para planos pagos (Render + Vercel)
- Configurar domínio customizado
- Implementar CDN
- Configurar monitoramento
- Fazer backups automáticos

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no Render e Vercel
2. Consulte a seção Troubleshooting
3. Verifique a documentação oficial:
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs

---

**Boa sorte com o deploy! 🎊**

