# ✅ Checklist de Deploy - BeautyFlow

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 ANTES DE COMEÇAR

- [ ] Repositório no GitHub está atualizado
- [ ] Conta no Render criada
- [ ] Conta no Vercel criada
- [ ] Tempo disponível: ~30 minutos

---

## 🗄️ RENDER - BANCO DE DADOS

- [ ] PostgreSQL criado
- [ ] Nome: `beautyflow-db`
- [ ] Plan: Free
- [ ] Status: "Available"
- [ ] **Internal Database URL copiada** ⚠️

---

## ⚙️ RENDER - BACKEND

### Configuração Básica
- [ ] Web Service criado
- [ ] Nome: `beautyflow-backend`
- [ ] Repositório conectado
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npm run build && npx prisma generate`
- [ ] Start Command: `npm start`
- [ ] Plan: Free

### Variáveis de Ambiente
- [ ] `DATABASE_URL` = [Internal Database URL]
- [ ] `JWT_SECRET` = [chave secreta forte]
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = [será atualizado depois]
- [ ] `PORT` = `3001`

### Deploy
- [ ] Build iniciado
- [ ] Build concluído com sucesso
- [ ] Serviço rodando (status: "Live")
- [ ] Endpoint `/health` testado e funcionando

### Migrações
- [ ] Shell aberto no Render
- [ ] Comando `npx prisma migrate deploy` executado
- [ ] Migrações aplicadas com sucesso

---

## 🎨 VERCEL - FRONTEND

### Configuração Básica
- [ ] Projeto criado
- [ ] Repositório conectado
- [ ] Root Directory: `frontend`
- [ ] Framework: Next.js (detectado)
- [ ] Build Command: `npm run build`

### Variáveis de Ambiente
- [ ] `NEXT_PUBLIC_API_URL` = [URL do backend no Render]

### Deploy
- [ ] Deploy iniciado
- [ ] Build concluído com sucesso
- [ ] URL do frontend anotada
- [ ] Página inicial carrega

---

## 🔗 INTEGRAÇÃO

- [ ] `FRONTEND_URL` atualizado no Render com URL do Vercel
- [ ] Serviço backend reiniciado
- [ ] CORS funcionando (sem erros no console)

---

## 🧪 TESTES

### Funcionalidades Básicas
- [ ] Página inicial carrega
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Dashboard carrega após login

### CRUDs
- [ ] Criar cliente
- [ ] Editar cliente
- [ ] Deletar cliente
- [ ] Criar serviço
- [ ] Editar serviço
- [ ] Criar agendamento
- [ ] Editar agendamento
- [ ] Visualizar agenda

### Funcionalidades Avançadas
- [ ] Agenda filtra por profissional
- [ ] Confirmar agendamento
- [ ] Concluir agendamento (cria transação)
- [ ] Financeiro mostra dados
- [ ] Financeiro filtra por profissional

---

## 📝 DOCUMENTAÇÃO

- [ ] URLs anotadas:
  - Backend: `https://...`
  - Frontend: `https://...`
- [ ] Credenciais guardadas com segurança
- [ ] Guias de deploy salvos

---

## 🎉 FINALIZAÇÃO

- [ ] Todos os itens acima marcados
- [ ] Aplicação funcionando em produção
- [ ] Testes realizados com sucesso
- [ ] Pronto para uso! 🚀

---

## ⚠️ LEMBRETES IMPORTANTES

1. **Backend no Render "dorme" após 15 min de inatividade**
   - Primeira requisição pode demorar ~30 segundos
   - Normal para plano gratuito

2. **Banco de dados Free tem limite de 90 dias**
   - Considere upgrade para produção

3. **Variáveis de ambiente sensíveis**
   - Nunca commite `.env` no Git
   - Use variáveis de ambiente nas plataformas

4. **Backups**
   - Configure backups regulares do banco
   - Exporte dados periodicamente

---

**Status do Deploy**: ⬜ Não iniciado | 🟡 Em andamento | ✅ Concluído

