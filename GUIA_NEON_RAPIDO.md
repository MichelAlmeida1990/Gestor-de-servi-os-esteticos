# 🚀 Guia Rápido - Neon (Banco de Dados)

## ⚡ Setup em 5 Minutos

### Passo 1: Criar Conta no Neon

1. Acesse: https://neon.tech
2. Clique em **"Sign Up"** ou **"Get Started"**
3. Escolha **"Sign up with GitHub"** (mais rápido)
4. Autorize o Neon a acessar seus repositórios
5. Complete o cadastro

### Passo 2: Criar Projeto

1. No dashboard, clique em **"Create Project"**
2. Preencha:
   - **Project Name**: `beautyflow` (ou qualquer nome)
   - **Region**: Escolha a mais próxima
     - Para Brasil: `US East (Ohio)` ou `Europe (Frankfurt)`
   - **PostgreSQL Version**: `16` (ou a mais recente)
   - **Compute Size**: **Free** ✅
3. Clique em **"Create Project"**
4. ⏳ Aguarde alguns segundos

### Passo 3: Copiar Connection String

1. Após criar o projeto, você verá a tela **"Connection Details"**
2. Na seção **"Connection string"**, você verá algo como:
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. **COPIE esta string completa** (incluindo `?sslmode=require`)
4. ⚠️ **IMPORTANTE**: Guarde esta URL! Você precisará no Render.

### Passo 4: Se Não Copiou, Como Pegar Depois

1. No dashboard do Neon, clique no seu projeto
2. Vá em **"Connection Details"** (menu lateral)
3. Na seção **"Connection string"**, copie a URL
4. Ou use a aba **"Connection Parameters"** para ver host, database, user, password separados

### Passo 5: Usar no Render

1. No Render, ao criar o Web Service
2. Adicione a variável de ambiente:
   ```
   DATABASE_URL = [Cole a Connection String do Neon aqui]
   ```
3. Pronto! O backend vai conectar ao Neon.

---

## 🔧 Configurar Prisma com Neon

O Prisma já está configurado para usar PostgreSQL, então funciona direto com Neon!

Apenas certifique-se que:
- ✅ A `DATABASE_URL` está correta
- ✅ Tem `?sslmode=require` no final (Neon exige SSL)

---

## ✅ Testar Conexão

### Via Render Shell

1. No Render, abra o Shell do serviço
2. Execute:
   ```bash
   cd backend
   npx prisma db push
   ```
3. Se funcionar, você verá as tabelas sendo criadas!

---

## 🐛 Problemas Comuns

### Erro: "SSL required"

**Solução**: Certifique-se que a URL tem `?sslmode=require` no final

### Erro: "Connection timeout"

**Solução**: 
- Verifique se o projeto Neon está ativo
- Verifique a região (escolha uma próxima)
- Free tier pode ter limites de conexão

### Erro: "Database does not exist"

**Solução**: 
- O Neon cria o banco automaticamente
- Use a Connection String completa que ele fornece
- Não precisa criar banco manualmente

---

## 💡 Dicas

1. **Free Tier do Neon:**
   - 3 projetos gratuitos
   - 0.5 GB storage
   - Auto-pause após inatividade (mas reativa rápido)

2. **Backups:**
   - Neon faz backups automáticos
   - Você pode restaurar via dashboard

3. **Performance:**
   - Free tier é suficiente para desenvolvimento/testes
   - Para produção com muito tráfego, considere upgrade

---

## 📚 Próximos Passos

Após configurar o Neon:
1. ✅ Copie a Connection String
2. ✅ Configure no Render (variável `DATABASE_URL`)
3. ✅ Execute migrações do Prisma
4. ✅ Teste o backend

---

**Pronto! Neon configurado! 🎉**

