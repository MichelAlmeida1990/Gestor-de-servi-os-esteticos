# 🔧 Troubleshooting - BeautyFlow

## ❌ Erro 500 no Registro

### Possíveis Causas:

1. **Prisma Client não gerado**
   ```powershell
   cd backend
   npm run prisma:generate
   ```

2. **Banco de dados não conectado**
   ```powershell
   # Verificar se Docker está rodando
   docker ps --filter "name=beautyflow-postgres"
   
   # Se não estiver, iniciar
   docker start beautyflow-postgres
   ```

3. **Erro no código**
   - Verificar logs do backend no terminal
   - O erro agora mostra mais detalhes no console

### Solução Rápida:

1. **Reiniciar o backend:**
   ```powershell
   # Parar o servidor (Ctrl+C)
   # Depois iniciar novamente
   npm run dev
   ```

2. **Verificar logs:**
   - Os erros agora aparecem no console do backend
   - Procure por "Erro no registro:" para ver detalhes

3. **Testar conexão com banco:**
   ```powershell
   npx prisma db push
   ```

## ✅ Erros Normais (Não são problemas):

- **401 Unauthorized** em `/auth/me` - Normal, usuário não está logado
- **Erro do ipapi.co** - Não é crítico, é serviço externo
- **React DevTools warning** - Apenas um aviso, não afeta funcionamento

## 🚀 Verificar se está tudo funcionando:

1. **Backend rodando:**
   - Acesse: http://localhost:3001/health
   - Deve retornar: `{"status":"ok","service":"BeautyFlow API"}`

2. **Frontend rodando:**
   - Acesse: http://localhost:3000
   - Deve mostrar a página inicial

3. **Banco de dados:**
   ```powershell
   docker ps --filter "name=beautyflow-postgres"
   ```
   - Deve mostrar o container rodando

---

**Se o erro persistir, verifique os logs do backend no terminal!**




