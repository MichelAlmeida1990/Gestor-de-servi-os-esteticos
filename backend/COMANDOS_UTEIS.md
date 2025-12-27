# 🚀 Comandos Úteis - BeautyFlow Backend

## ⚡ Iniciar o Servidor

### Opção 1: Usando npm (Recomendado)
```powershell
npm run dev
```

### Opção 2: Usando npx diretamente
```powershell
npx tsx watch src/index.ts
```

### Opção 3: Usando nodemon
```powershell
npx nodemon --exec tsx src/index.ts
```

### Opção 4: Compilar e rodar
```powershell
npm run build
npm start
```

## 🗄️ Banco de Dados

### Gerar Prisma Client
```powershell
npm run prisma:generate
```

### Aplicar Schema (sem migrations)
```powershell
npx prisma db push
```

### Criar Migration
```powershell
npm run prisma:migrate
```

### Abrir Prisma Studio (Interface Gráfica)
```powershell
npm run prisma:studio
```

## 🐳 Docker

### Verificar container
```powershell
docker ps --filter "name=beautyflow-postgres"
```

### Parar container
```powershell
docker stop beautyflow-postgres
```

### Iniciar container
```powershell
docker start beautyflow-postgres
```

### Ver logs
```powershell
docker logs beautyflow-postgres
```

## 🔧 Troubleshooting

### Se `tsx` não funcionar:
```powershell
# Reinstalar dependências
Remove-Item -Recurse -Force node_modules
npm install

# Ou usar nodemon
npx nodemon --exec tsx src/index.ts
```

### Se o banco não conectar:
```powershell
# Verificar se Docker está rodando
docker ps

# Reiniciar container
docker restart beautyflow-postgres
```

### Limpar e reinstalar tudo:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

**BeautyFlow** - Sistema de gestão para salões de beleza 💅





