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

## 🗄️ PARTE 1: Configurar Banco de Dados PostgreSQL (GRATUITO)

⚠️ **IMPORTANTE**: O Render não oferece mais PostgreSQL gratuito. Escolha uma das opções abaixo:

### 📋 Opções Disponíveis

Consulte `OPCOES_BANCO_GRATUITO.md` para ver todas as opções.

**Recomendação:** Use **Neon** (permite 3 projetos gratuitos) ou **Railway** ($5 crédito/mês).

---

### 🚀 OPÇÃO A: Usar Neon (Recomendado)

#### Passo 1.1: Criar Conta no Neon

1. Acesse: https://neon.tech
2. Clique em **"Sign Up"** ou **"Get Started"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Neon a acessar seus repositórios
5. Complete o cadastro

#### Passo 1.2: Criar Projeto no Neon

1. No dashboard, clique em **"Create Project"**
2. Preencha os campos:
   - **Project Name**: `beautyflow`
   - **Region**: Escolha a mais próxima (ex: `US East (Ohio)` ou `Europe (Frankfurt)`)
   - **PostgreSQL Version**: `16` (ou a mais recente)
   - **Compute Size**: **Free** ✅
3. Clique em **"Create Project"**
4. ⏳ Aguarde alguns segundos para o projeto ser criado

#### Passo 1.3: Copiar Connection String

1. Após o projeto ser criado, você verá a tela de **"Connection Details"**
2. Na seção **"Connection string"**, você verá:
   - **Connection string**: `postgresql://user:password@hostname/dbname?sslmode=require`
3. **COPIE a Connection string completa**
4. ⚠️ **IMPORTANTE**: Guarde esta URL, você precisará dela depois!
5. Se não copiou, pode pegar depois em: **Settings** → **Connection Details**

---

### 🚂 OPÇÃO B: Usar Railway

#### Passo 1.1: Criar Conta no Railway

1. Acesse: https://railway.app
2. Clique em **"Start a New Project"** ou **"Login"**
3. Escolha **"Login with GitHub"**
4. Autorize o Railway a acessar seus repositórios
5. Complete o cadastro

#### Passo 1.2: Criar PostgreSQL no Railway

1. No dashboard, clique em **"New Project"**
2. Selecione **"Empty Project"**
3. Clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. ⏳ Aguarde alguns segundos para o banco ser criado

#### Passo 1.3: Copiar Connection String

1. Clique no serviço PostgreSQL criado
2. Vá na aba **"Variables"**
3. Você verá a variável **`DATABASE_URL`**
4. **COPIE o valor completo** (começa com `postgresql://`)
5. ⚠️ **IMPORTANTE**: Guarde esta URL!

---

### 🐘 OPÇÃO C: Usar ElephantSQL

#### Passo 1.1: Criar Conta no ElephantSQL

1. Acesse: https://www.elephantsql.com
2. Clique em **"Sign Up"**
3. Preencha o formulário ou use **"Sign up with GitHub"**
4. Complete o cadastro

#### Passo 1.2: Criar Instância

1. No dashboard, clique em **"Create New Instance"**
2. Preencha:
   - **Name**: `beautyflow`
   - **Plan**: **Tiny Turtle (Free)** ✅
   - **Region**: Escolha a mais próxima
   - **Data Center**: Escolha o mais próximo
3. Clique em **"Select Region"** e depois **"Review"**
4. Clique em **"Create instance"**
5. ⏳ Aguarde alguns segundos

#### Passo 1.3: Copiar Connection String

1. Clique na instância criada
2. Na seção **"Details"**, você verá:
   - **URL**: `postgresql://user:password@hostname:5432/dbname`
3. **COPIE a URL completa**
4. ⚠️ **IMPORTANTE**: Guarde esta URL!

---

## ⚙️ PARTE 2: Deploy do Backend no Render

### Passo 2.1: Criar Conta no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"Get Started for Free"** ou **"Sign Up"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar seus repositórios
5. Complete o cadastro

### Passo 2.2: Criar Web Service (Backend)

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
DATABASE_URL = [Cole a Connection String que você copiou (Neon/Railway/ElephantSQL)]
```
⚠️ **IMPORTANTE**: Use a URL completa que você copiou do banco de dados escolhido!

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

### Passo 2.3: Executar Migrações do Prisma

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

**Nota**: Se estiver usando Neon, Railway ou ElephantSQL, a conexão é externa, então não precisa de "Internal URL" - use a URL normal que você copiou.

### Passo 2.4: Testar o Backend

1. No painel do serviço, copie a **URL** (ex: `https://beautyflow-backend.onrender.com`)
2. Teste no navegador: `https://sua-url.onrender.com/health`
3. ✅ Deve retornar: `{"status":"ok","service":"BeautyFlow API"}`

### Passo 2.5: Verificar Logs

1. No painel do serviço, clique em **"Logs"**
2. Verifique se não há erros
3. Se houver erros, verifique:
   - Se `DATABASE_URL` está correto
   - Se as migrações foram executadas
   - Se o build foi bem-sucedido

---

## 🎨 PARTE 3: Deploy do Frontend no Vercel

### Passo 3.1: Criar Conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios
5. Complete o cadastro

### Passo 3.2: Criar Novo Projeto

1. No dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Selecione o repositório: `MichelAlmeida1990/Gestor-de-servi-os-esteticos`
4. Clique em **"Import"**

### Passo 3.3: Configurar o Projeto

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

### Passo 3.4: Fazer Deploy

1. Clique em **"Deploy"**
2. ⏳ Aguarde 2-5 minutos para o build
3. ✅ Quando terminar, você verá a URL do seu app (ex: `https://beautyflow-frontend.vercel.app`)

### Passo 3.5: Atualizar FRONTEND_URL no Render

1. Volte ao Render (backend)
2. Vá em **"Environment"** → **"Environment Variables"**
3. Edite a variável `FRONTEND_URL`
4. Cole a URL do Vercel (ex: `https://beautyflow-frontend.vercel.app`)
5. Clique em **"Save Changes"**
6. O serviço será reiniciado automaticamente

### Passo 3.6: Testar o Frontend

1. Acesse a URL do Vercel
2. Teste:
   - ✅ Página inicial carrega
   - ✅ Botão de registro funciona
   - ✅ Login funciona
   - ✅ Dashboard carrega após login

---

## 🔗 PARTE 4: Configuração Final

### Passo 4.1: Verificar CORS

1. No Render (backend), verifique se `FRONTEND_URL` está correto
2. Teste fazer login no frontend
3. Se der erro de CORS, verifique:
   - URL do frontend no `FRONTEND_URL`
   - Se a URL começa com `https://`
   - Se não tem barra `/` no final

### Passo 4.2: Testar Funcionalidades

Teste todas as funcionalidades:
- [ ] Registro de usuário
- [ ] Login
- [ ] Dashboard carrega dados
- [ ] Criar cliente
- [ ] Criar serviço
- [ ] Criar agendamento
- [ ] Visualizar agenda
- [ ] Financeiro funciona

### Passo 4.3: URLs Finais

Anote suas URLs:
- **Backend**: `https://beautyflow-backend.onrender.com`
- **Frontend**: `https://beautyflow-frontend.vercel.app`
- **Banco de Dados**: (Internal URL no Render)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se `DATABASE_URL` está correto no Render
2. Use a **Connection String completa** que você copiou (Neon/Railway/ElephantSQL)
3. Verifique se o banco está rodando (status "Active" ou "Running")
4. Se usar Neon: certifique-se que a URL tem `?sslmode=require` no final
5. Se usar Railway: verifique se o serviço está ativo
6. Se usar ElephantSQL: verifique se a instância não expirou (free tier pode ter limites)

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

