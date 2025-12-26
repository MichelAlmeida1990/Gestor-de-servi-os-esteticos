# 🚀 Setup Rápido do Banco de Dados

## ⚡ Passo a Passo Rápido

### 1. Criar arquivo `.env` na pasta `backend`

Crie um arquivo chamado `.env` (sem extensão) na pasta `backend` com este conteúdo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beautyflow?schema=public"
JWT_SECRET="beautyflow-super-secret-jwt-key-change-in-production-2025"
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Ajuste `postgres:postgres` para seu usuário:senha do PostgreSQL!

### 2. Criar o banco de dados

Abra o terminal e execute:

```bash
# Windows (PowerShell)
psql -U postgres
CREATE DATABASE beautyflow;
\q

# Ou via linha de comando direto
createdb -U postgres beautyflow
```

### 3. Rodar as migrações

```bash
cd backend
npm run prisma:migrate
```

## ✅ Pronto!

Se tudo der certo, você verá:
```
✔ Migration created and applied successfully.
```

---

## 🔍 Verificar se o PostgreSQL está rodando

```bash
# Windows
Get-Service -Name postgresql*

# Ou tente conectar
psql -U postgres -h localhost
```

Se não estiver rodando, inicie o serviço PostgreSQL.

---

## 📝 Nota

Se você usar Docker, pode criar o banco assim:

```bash
docker run --name postgres-beautyflow \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=beautyflow \
  -p 5432:5432 \
  -d postgres
```

Depois use no `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beautyflow?schema=public"
```




