# 📖 Deploy Passo a Passo - BeautyFlow (Versão Simplificada)

## 🎯 Objetivo
Fazer deploy completo do BeautyFlow usando serviços 100% gratuitos.

---

## ⚡ INÍCIO RÁPIDO

### 1️⃣ Banco de Dados PostgreSQL (5 minutos)

⚠️ **Render não tem PostgreSQL gratuito mais!** Escolha uma opção:

#### OPÇÃO A: Neon (Recomendado)
1. Acesse: https://neon.tech
2. **Sign Up** com GitHub
3. **Create Project** → Nome: `beautyflow`
4. **COPIE a Connection String** (ex: `postgresql://user:pass@host/db?sslmode=require`)

#### OPÇÃO B: Railway
1. Acesse: https://railway.app
2. **Login** com GitHub
3. **New Project** → **Add PostgreSQL**
4. **COPIE a DATABASE_URL** das variáveis

#### OPÇÃO C: ElephantSQL
1. Acesse: https://www.elephantsql.com
2. **Sign Up** → **Create Instance** → **Tiny Turtle (Free)**
3. **COPIE a URL** da instância

### 2️⃣ Render - Backend (10 minutos)

#### B. Criar Web Service
1. **New +** → **Web Service**
2. Conecte GitHub → Selecione repositório
3. Configurações:
   - Name: `beautyflow-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build && npx prisma generate`
   - Start Command: `npm start`
   - Plan: **Free**

4. Variáveis de Ambiente:
   ```
   DATABASE_URL = [Cole a Connection String do Neon/Railway/ElephantSQL]
   JWT_SECRET = sua-chave-secreta-aqui-123456
   NODE_ENV = production
   FRONTEND_URL = https://seu-app.vercel.app
   PORT = 3001
   ```

5. **Create Web Service**
6. ⏳ Aguarde 5-10 minutos

#### C. Executar Migrações
1. No serviço → Aba **"Shell"**
2. Execute:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. ✅ Pronto! Backend rodando

---

### 3️⃣ Vercel - Frontend (10 minutos)

#### A. Criar Projeto
1. Acesse: https://vercel.com
2. **Add New...** → **Project**
3. Conecte GitHub → Selecione repositório
4. Configurações:
   - Root Directory: `frontend`
   - Framework: Next.js (auto)
   - Build Command: `npm run build` (padrão)

#### B. Variáveis de Ambiente
Antes de deploy, adicione:
```
NEXT_PUBLIC_API_URL = https://beautyflow-backend.onrender.com
```
(Substitua pela URL real do seu backend)

#### C. Deploy
1. Clique em **Deploy**
2. ⏳ Aguarde 2-5 minutos
3. ✅ Pronto! Frontend rodando

#### D. Atualizar CORS
1. Volte ao Render
2. Edite `FRONTEND_URL` com a URL do Vercel
3. Salve (reinicia automaticamente)

---

## ✅ TESTE FINAL

1. Acesse a URL do Vercel
2. Teste:
   - ✅ Página inicial carrega
   - ✅ Registro funciona
   - ✅ Login funciona
   - ✅ Dashboard carrega

---

## 🔑 URLs IMPORTANTES

Anote estas URLs:
- **Backend**: `https://beautyflow-backend.onrender.com`
- **Frontend**: `https://beautyflow-frontend.vercel.app`
- **Banco**: (Internal URL no Render)

---

## ⚠️ PROBLEMAS COMUNS

### Backend não conecta ao banco
→ Verifique `DATABASE_URL` (use Internal URL)

### Erro de CORS
→ Verifique `FRONTEND_URL` no Render (sem barra no final)

### Frontend não encontra API
→ Verifique `NEXT_PUBLIC_API_URL` na Vercel

### Build falha
→ Verifique logs e root directory (`backend` ou `frontend`)

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para versão detalhada, veja: `GUIA_DEPLOY_GRATUITO.md`

---

**Tempo total estimado: 25-30 minutos** ⏱️

