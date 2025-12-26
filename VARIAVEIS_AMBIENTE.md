# 🔐 Variáveis de Ambiente - BeautyFlow

## 📋 Lista Completa de Variáveis

### 🗄️ Render - Backend

#### Obrigatórias:
```env
DATABASE_URL=postgresql://user:password@hostname:5432/dbname
```
⚠️ Use a **Internal Database URL** do PostgreSQL no Render

```env
JWT_SECRET=sua-chave-secreta-super-forte-aqui
```
💡 Gere uma chave forte em: https://randomkeygen.com/
💡 Use pelo menos 32 caracteres aleatórios

```env
NODE_ENV=production
```

```env
PORT=3001
```

#### Opcionais (mas recomendadas):
```env
FRONTEND_URL=https://seu-app.vercel.app
```
⚠️ Configure após fazer deploy do frontend
⚠️ Sem barra `/` no final
⚠️ Use `https://` (não `http://`)

```env
HOST=0.0.0.0
```
(Padrão já está no código)

---

### 🎨 Vercel - Frontend

#### Obrigatória:
```env
NEXT_PUBLIC_API_URL=https://beautyflow-backend.onrender.com
```
⚠️ Substitua pela URL real do seu backend
⚠️ Deve começar com `NEXT_PUBLIC_` para ser acessível no cliente
⚠️ Use `https://` (não `http://`)

---

## 📝 Como Adicionar no Render

1. No painel do serviço, clique em **"Environment"**
2. Clique em **"Add Environment Variable"**
3. Digite o **Key** e o **Value**
4. Clique em **"Save Changes"**
5. O serviço será reiniciado automaticamente

---

## 📝 Como Adicionar no Vercel

1. No painel do projeto, clique em **"Settings"**
2. Vá em **"Environment Variables"**
3. Clique em **"Add New"**
4. Digite o **Key** e o **Value**
5. Selecione os ambientes (Production, Preview, Development)
6. Clique em **"Save"**
7. Faça um novo deploy para aplicar

---

## 🔒 Segurança

### ✅ FAÇA:
- ✅ Use variáveis de ambiente para secrets
- ✅ Gere chaves fortes e aleatórias
- ✅ Use HTTPS em produção
- ✅ Rotacione secrets periodicamente

### ❌ NÃO FAÇA:
- ❌ Commite `.env` no Git
- ❌ Use secrets fracos ou previsíveis
- ❌ Compartilhe secrets publicamente
- ❌ Use a mesma chave em dev e produção

---

## 🧪 Testar Variáveis

### Backend (Render)
No Shell do Render:
```bash
echo $DATABASE_URL
echo $JWT_SECRET
echo $NODE_ENV
```

### Frontend (Vercel)
No código:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL);
```

---

## 🔄 Atualizar Variáveis

### Render
1. Edite a variável
2. Salve
3. Serviço reinicia automaticamente

### Vercel
1. Edite a variável
2. Salve
3. Faça um novo deploy (ou aguarde próximo)

---

## 📚 Referências

- Render Env Vars: https://render.com/docs/environment-variables
- Vercel Env Vars: https://vercel.com/docs/concepts/projects/environment-variables

