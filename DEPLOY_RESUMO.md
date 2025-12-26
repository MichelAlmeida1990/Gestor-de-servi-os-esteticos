# 🚀 Resumo Rápido de Deploy - BeautyFlow

## ✅ Arquivos Criados/Atualizados

### Backend
- ✅ `backend/Dockerfile` - Para deploy no Render
- ✅ `backend/.dockerignore` - Ignorar arquivos desnecessários
- ✅ `backend/src/index.ts` - Atualizado para usar `process.env.PORT`

### Frontend
- ✅ `frontend/lib/api.ts` - Configuração centralizada da API_URL
- ✅ `frontend/vercel.json` - Configuração do Vercel
- ✅ `frontend/app/(auth)/login/page.tsx` - Atualizado para usar API_URL
- ✅ `frontend/app/(auth)/register/page.tsx` - Atualizado para usar API_URL
- ✅ `frontend/app/(dashboard)/layout.tsx` - Atualizado para usar API_URL
- ✅ `frontend/app/(dashboard)/dashboard/page.tsx` - Atualizado para usar API_URL

### Documentação
- ✅ `GUIA_DEPLOY.md` - Guia completo passo a passo
- ✅ `DEPLOY_CHECKLIST.md` - Checklist detalhado

---

## ⚠️ AÇÃO NECESSÁRIA: Atualizar Páginas Restantes

As seguintes páginas ainda precisam ser atualizadas para usar `API_URL`:

1. `frontend/app/(dashboard)/dashboard/agenda/page.tsx`
2. `frontend/app/(dashboard)/dashboard/clientes/page.tsx`
3. `frontend/app/(dashboard)/dashboard/profissionais/page.tsx`
4. `frontend/app/(dashboard)/dashboard/servicos/page.tsx`
5. `frontend/app/(dashboard)/dashboard/financeiro/page.tsx`

**Como atualizar:**
1. Adicionar import: `import { API_URL } from '@/lib/api';`
2. Substituir todas as ocorrências de `'http://localhost:3001'` por `${API_URL}`

**Exemplo:**
```typescript
// Antes
fetch('http://localhost:3001/clients', { ... })

// Depois
import { API_URL } from '@/lib/api';
fetch(`${API_URL}/clients`, { ... })
```

---

## 🚀 Passos Rápidos para Deploy

### 1. Backend (Render)
1. Acesse https://dashboard.render.com
2. "New +" → "PostgreSQL" → Criar banco
3. "New +" → "Web Service" → Conectar repo
4. Configurar:
   - Build: `npm install && npm run build && npx prisma generate`
   - Start: `npm start`
   - Root: `backend`
5. Adicionar variáveis:
   - `DATABASE_URL` (Internal URL do PostgreSQL)
   - `JWT_SECRET` (gerar chave forte)
   - `NODE_ENV=production`
   - `FRONTEND_URL` (atualizar depois)
6. Executar migrações via Shell: `npx prisma migrate deploy`

### 2. Frontend (Vercel)
1. Acesse https://vercel.com
2. "Add New..." → "Project" → Importar repo
3. Configurar:
   - Framework: Next.js (auto)
   - Root Directory: `frontend`
4. Adicionar variável:
   - `NEXT_PUBLIC_API_URL` = URL do backend Render
5. Deploy!

### 3. Atualizar URLs
- Backend: Atualizar `FRONTEND_URL` com URL do Vercel
- Frontend: Verificar se `NEXT_PUBLIC_API_URL` está correto

---

## 📝 Variáveis de Ambiente

### Render (Backend)
```env
DATABASE_URL=postgresql://... (Internal URL)
JWT_SECRET=chave-forte-aleatoria
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=https://beautyflow-backend.onrender.com
```

---

## 🔗 URLs Esperadas

- **Backend**: `https://beautyflow-backend.onrender.com`
- **Frontend**: `https://beautyflow.vercel.app`

---

## 💰 Custos

- **Render Free**: Backend pode entrar em sleep (15min inatividade)
- **Render Paid**: $7/mês (backend) + $7/mês (PostgreSQL) = $14/mês
- **Vercel Free**: 100GB bandwidth/mês = **GRÁTIS**

---

## ✅ Próximos Passos

1. Atualizar páginas restantes do dashboard para usar API_URL
2. Fazer deploy do backend no Render
3. Fazer deploy do frontend no Vercel
4. Testar todas as funcionalidades
5. Configurar domínio customizado (opcional)

