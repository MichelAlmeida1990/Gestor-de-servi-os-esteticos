# 🗄️ Guia Completo de Configuração do Banco de Dados - BeautyFlow

## 📋 Índice
1. [Opção 1: PostgreSQL Local (Recomendado para desenvolvimento)](#opção-1-postgresql-local)
2. [Opção 2: Docker (Mais fácil e isolado)](#opção-2-docker)
3. [Opção 3: Serviços Cloud (Produção)](#opção-3-serviços-cloud)
4. [Configuração do .env](#configuração-do-env)
5. [Rodando as Migrações](#rodando-as-migrações)
6. [Verificando se Funcionou](#verificando-se-funcionou)
7. [Troubleshooting Completo](#troubleshooting-completo)

---

## 🎯 Opção 1: PostgreSQL Local

### Passo 1: Instalar PostgreSQL

#### Windows:
1. Baixe o instalador em: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Durante a instalação:
   - **Porta**: Deixe 5432 (padrão)
   - **Superuser password**: Anote a senha que você definir (ex: `postgres`)
   - **Locale**: Portuguese, Brazil
4. Complete a instalação

#### Verificar se está instalado:
```powershell
# No PowerShell
Get-Service -Name postgresql*
```

Se aparecer o serviço, está instalado. Se não estiver rodando:
```powershell
Start-Service postgresql-x64-XX  # Substitua XX pela versão
```

### Passo 2: Criar o Banco de Dados

Abra o **pgAdmin** (instalado com o PostgreSQL) ou use o terminal:

#### Via pgAdmin (Interface Gráfica):
1. Abra o pgAdmin
2. Conecte-se ao servidor (senha que você definiu)
3. Clique com botão direito em "Databases"
4. Selecione "Create" > "Database"
5. Nome: `beautyflow`
6. Clique em "Save"

#### Via Terminal (Linha de Comando):
```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco
CREATE DATABASE beautyflow;

# Sair
\q
```

#### Via PowerShell direto:
```powershell
# Se o PostgreSQL estiver no PATH
createdb -U postgres beautyflow
```

### Passo 3: Configurar o .env

O arquivo `.env` já foi criado automaticamente na pasta `backend`. Verifique se está correto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beautyflow?schema=public"
```

**⚠️ IMPORTANTE**: 
- Se sua senha do PostgreSQL não for `postgres`, altere no `.env`
- Formato: `postgresql://USUARIO:SENHA@HOST:PORTA/NOME_BANCO?schema=public`

### Passo 4: Testar a Conexão

```powershell
cd backend
npx prisma db pull
```

Se não der erro, a conexão está funcionando!

---

## 🐳 Opção 2: Docker (Mais Fácil)

### Passo 1: Instalar Docker Desktop

1. Baixe em: https://www.docker.com/products/docker-desktop
2. Instale e reinicie o computador
3. Abra o Docker Desktop e aguarde iniciar

### Passo 2: Criar Container do PostgreSQL

Execute no terminal (PowerShell ou CMD):

```powershell
docker run --name beautyflow-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=beautyflow `
  -p 5432:5432 `
  -d postgres:latest
```

**Explicação:**
- `--name beautyflow-postgres`: Nome do container
- `-e POSTGRES_PASSWORD=postgres`: Senha do banco
- `-e POSTGRES_DB=beautyflow`: Cria o banco automaticamente
- `-p 5432:5432`: Mapeia a porta
- `-d`: Roda em background

### Passo 3: Verificar se está rodando

```powershell
docker ps
```

Você deve ver o container `beautyflow-postgres` na lista.

### Passo 4: Configurar o .env

O `.env` já está configurado para funcionar com Docker:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beautyflow?schema=public"
```

### Comandos Úteis do Docker:

```powershell
# Parar o container
docker stop beautyflow-postgres

# Iniciar o container
docker start beautyflow-postgres

# Ver logs
docker logs beautyflow-postgres

# Remover o container (se precisar recriar)
docker rm -f beautyflow-postgres
```

---

## ☁️ Opção 3: Serviços Cloud (Para Produção)

### Supabase (Recomendado - Grátis até certo limite)

1. Acesse: https://supabase.com
2. Crie uma conta (grátis)
3. Crie um novo projeto
4. Vá em "Settings" > "Database"
5. Copie a "Connection string" (URI)
6. Cole no `.env`:

```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[PROJETO].supabase.co:5432/postgres"
```

### Neon (PostgreSQL Serverless)

1. Acesse: https://neon.tech
2. Crie uma conta (grátis)
3. Crie um novo projeto
4. Copie a connection string
5. Cole no `.env`

### Railway

1. Acesse: https://railway.app
2. Crie uma conta
3. Crie um novo projeto > "Add PostgreSQL"
4. Copie a DATABASE_URL
5. Cole no `.env`

---

## ⚙️ Configuração do .env

O arquivo `.env` está localizado em: `backend/.env`

### Estrutura Completa:

```env
# ============================================
# BANCO DE DADOS
# ============================================
# Formato: postgresql://usuario:senha@host:porta/nome_banco?schema=public
# 
# Exemplos:
# Local: postgresql://postgres:postgres@localhost:5432/beautyflow?schema=public
# Docker: postgresql://postgres:postgres@localhost:5432/beautyflow?schema=public
# Supabase: postgresql://postgres:[SENHA]@db.xxx.supabase.co:5432/postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beautyflow?schema=public"

# ============================================
# AUTENTICAÇÃO JWT
# ============================================
# IMPORTANTE: Em produção, use uma chave segura e aleatória!
# Gere uma chave segura: openssl rand -base64 32
JWT_SECRET="beautyflow-super-secret-jwt-key-change-in-production-2025"

# ============================================
# SERVIDOR
# ============================================
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# ============================================
# FRONTEND
# ============================================
FRONTEND_URL=http://localhost:3000
```

### Como Editar:

1. Abra o arquivo `backend/.env` no editor de texto
2. Ajuste os valores conforme necessário
3. **NUNCA** commite o `.env` no Git (já está no .gitignore)

---

## 🚀 Rodando as Migrações

### Passo 1: Verificar se o banco está acessível

```powershell
cd backend

# Testar conexão
npx prisma db pull
```

Se der erro, verifique:
- PostgreSQL está rodando?
- `.env` está correto?
- Banco de dados existe?

### Passo 2: Gerar Prisma Client

```powershell
npm run prisma:generate
```

### Passo 3: Criar e Aplicar Migrações

```powershell
npm run prisma:migrate
```

Ou diretamente:
```powershell
npx prisma migrate dev --name init
```

### O que acontece:

1. Prisma cria uma pasta `prisma/migrations/`
2. Cria todas as tabelas no banco
3. Aplica as mudanças
4. Gera o Prisma Client atualizado

### Saída Esperada:

```
✔ Generated Prisma Client
✔ Migration created and applied successfully.
```

---

## ✅ Verificando se Funcionou

### 1. Verificar Tabelas Criadas

```powershell
# Via Prisma Studio (Interface Gráfica)
npm run prisma:studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode ver todas as tabelas.

### 2. Verificar via SQL

```powershell
psql -U postgres -d beautyflow

# Listar tabelas
\dt

# Ver estrutura de uma tabela
\d users

# Sair
\q
```

### 3. Testar a API

```powershell
# Iniciar o backend
npm run dev

# Em outro terminal, testar
curl http://localhost:3001/health
```

Deve retornar: `{"status":"ok","service":"BeautyFlow API"}`

---

## 🔧 Troubleshooting Completo

### Erro: "Can't reach database server"

**Causas possíveis:**
1. PostgreSQL não está rodando
2. Porta errada no `.env`
3. Firewall bloqueando

**Soluções:**

```powershell
# Verificar se PostgreSQL está rodando (Windows)
Get-Service -Name postgresql*

# Se não estiver, iniciar
Start-Service postgresql-x64-XX

# Verificar porta
netstat -an | findstr 5432

# Testar conexão manual
psql -U postgres -h localhost -p 5432
```

### Erro: "database does not exist"

**Solução:**
```powershell
# Criar o banco
psql -U postgres
CREATE DATABASE beautyflow;
\q
```

### Erro: "password authentication failed"

**Causa:** Senha errada no `.env`

**Solução:**
1. Verifique a senha do PostgreSQL
2. Teste a conexão: `psql -U postgres -h localhost`
3. Atualize o `.env` com a senha correta

### Erro: "relation already exists"

**Causa:** Tabelas já existem no banco

**Solução:**
```powershell
# Resetar o banco (CUIDADO: apaga todos os dados!)
npx prisma migrate reset

# Ou deletar e recriar o banco
psql -U postgres
DROP DATABASE beautyflow;
CREATE DATABASE beautyflow;
\q
```

### Erro: "Prisma Client not generated"

**Solução:**
```powershell
npm run prisma:generate
```

### PostgreSQL não inicia no Windows

**Soluções:**
1. Verificar logs: `C:\Program Files\PostgreSQL\XX\data\log\`
2. Verificar se a porta está livre: `netstat -an | findstr 5432`
3. Reinstalar o PostgreSQL
4. Usar Docker como alternativa

### Docker: Container não inicia

**Soluções:**
```powershell
# Ver logs
docker logs beautyflow-postgres

# Verificar se a porta está em uso
netstat -an | findstr 5432

# Remover e recriar
docker rm -f beautyflow-postgres
docker run --name beautyflow-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=beautyflow -p 5432:5432 -d postgres:latest
```

---

## 📝 Checklist Final

Antes de rodar as migrações, verifique:

- [ ] PostgreSQL está instalado e rodando (ou Docker está rodando)
- [ ] Banco de dados `beautyflow` foi criado
- [ ] Arquivo `.env` existe na pasta `backend`
- [ ] `DATABASE_URL` no `.env` está correto
- [ ] Consegue conectar via `psql` ou `pgAdmin`
- [ ] Executou `npm install` na pasta `backend`

---

## 🎯 Próximos Passos

Após rodar as migrações com sucesso:

1. ✅ Banco de dados configurado
2. ✅ Tabelas criadas
3. ✅ Prisma Client gerado
4. 🚀 Iniciar backend: `npm run dev`
5. 🚀 Iniciar frontend: `cd ../frontend && npm run dev`
6. 🎉 Sistema pronto para usar!

---

## 💡 Dicas

- **Desenvolvimento**: Use Docker (mais fácil de gerenciar)
- **Produção**: Use Supabase, Neon ou Railway
- **Backup**: Sempre faça backup antes de `migrate reset`
- **Prisma Studio**: Use para visualizar dados: `npm run prisma:studio`

---

**Última atualização**: Janeiro 2025  
**BeautyFlow** - Sistema de gestão para salões de beleza 💅
