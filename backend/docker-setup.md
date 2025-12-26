# 🐳 Setup Rápido com Docker - BeautyFlow

## ⚡ Comandos Rápidos

### 1. Criar e Iniciar o Container PostgreSQL

```powershell
docker run --name beautyflow-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=beautyflow `
  -p 5432:5432 `
  -d postgres:latest
```

### 2. Verificar se está rodando

```powershell
docker ps
```

### 3. Rodar as Migrações

```powershell
cd backend
npm run prisma:migrate
```

---

## 📋 Explicação dos Comandos

- `--name beautyflow-postgres`: Nome do container
- `-e POSTGRES_PASSWORD=postgres`: Senha do banco (pode mudar)
- `-e POSTGRES_DB=beautyflow`: Cria o banco automaticamente
- `-p 5432:5432`: Mapeia porta do container para o host
- `-d`: Roda em background (detached)
- `postgres:latest`: Imagem do PostgreSQL

---

## 🔧 Comandos Úteis

```powershell
# Parar o container
docker stop beautyflow-postgres

# Iniciar o container
docker start beautyflow-postgres

# Ver logs
docker logs beautyflow-postgres

# Remover o container (se precisar recriar)
docker rm -f beautyflow-postgres

# Conectar ao banco via psql
docker exec -it beautyflow-postgres psql -U postgres -d beautyflow
```

---

## ✅ Pronto!

Depois de rodar o container, o `.env` já está configurado para funcionar!




