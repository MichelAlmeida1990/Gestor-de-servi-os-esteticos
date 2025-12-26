# 🔒 Melhorias de Segurança Sugeridas - BeautyFlow

## 📊 Prioridade: ALTA (Implementar Imediatamente)

### 1. **JWT Secret Seguro em Produção**
**Problema Atual:**
```typescript
secret: process.env.JWT_SECRET || 'beautyflow-secret-key' // ⚠️ Fallback inseguro
```

**Risco:** Se `JWT_SECRET` não estiver definido, usa uma chave padrão conhecida.

**Solução:**
- ✅ Validar que `JWT_SECRET` existe em produção
- ✅ Gerar chave forte e única para cada ambiente
- ✅ Nunca usar fallback em produção

**Implementação:**
```typescript
// backend/src/server.ts
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET deve ser definido em produção!');
  }
  console.warn('⚠️ Usando JWT_SECRET padrão (apenas desenvolvimento)');
}

await server.register(jwt, {
  secret: jwtSecret || 'beautyflow-secret-key-dev-only',
});
```

---

### 2. **Rate Limiting (Proteção contra Ataques de Força Bruta)**
**Problema Atual:** Não há limite de tentativas de login.

**Risco:** Ataques de força bruta podem tentar adivinhar senhas.

**Solução:** Implementar rate limiting nas rotas de autenticação.

**Implementação:**
```bash
npm install @fastify/rate-limit
```

```typescript
// backend/src/server.ts
import rateLimit from '@fastify/rate-limit';

await server.register(rateLimit, {
  global: false, // Aplicar apenas em rotas específicas
});

// Em auth.ts
fastify.post('/auth/login', {
  preHandler: [
    fastify.authenticate, // Remover, pois login não precisa auth
    async (request, reply) => {
      await fastify.rateLimit({
        max: 5, // 5 tentativas
        timeWindow: '15 minutes', // por 15 minutos
        keyGenerator: (request) => request.ip, // Por IP
      })(request, reply);
    }
  ],
}, async (request, reply) => {
  // ... código de login
});
```

---

### 3. **Validação de Senha Mais Forte**
**Problema Atual:**
```typescript
password: z.string().min(6) // ⚠️ Muito fraco
```

**Risco:** Senhas fracas são fáceis de quebrar.

**Solução:** Exigir senhas mais complexas.

**Implementação:**
```typescript
// backend/src/routes/auth.ts
const passwordSchema = z.string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  // ...
});
```

---

### 4. **Expiração de Token JWT**
**Problema Atual:** Tokens não expiram.

**Risco:** Se um token for roubado, pode ser usado indefinidamente.

**Solução:** Adicionar expiração aos tokens.

**Implementação:**
```typescript
// backend/src/routes/auth.ts
const token = fastify.jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role,
  },
  {
    expiresIn: '7d', // Token expira em 7 dias
  }
);
```

---

### 5. **Verificação Explícita de establishmentId em findUnique**
**Problema Atual:** Após `updateMany`, alguns `findUnique` não verificam `establishmentId`.

**Risco:** Baixo, mas melhora segurança defensiva.

**Solução:** Adicionar verificação explícita.

**Implementação:**
```typescript
// Exemplo em clients.ts (PUT)
const updatedClient = await prisma.client.findFirst({
  where: {
    id,
    establishmentId: user.establishments[0].id, // ✅ Verificação explícita
  },
});

if (!updatedClient) {
  return reply.status(404).send({ error: 'Cliente não encontrado' });
}
```

---

## 📊 Prioridade: MÉDIA (Implementar em Breve)

### 6. **HTTPS em Produção**
**Problema Atual:** Sistema roda em HTTP (desenvolvimento).

**Risco:** Dados trafegam em texto plano.

**Solução:** Usar HTTPS em produção (certificado SSL).

**Implementação:**
- Configurar certificado SSL no servidor
- Redirecionar HTTP para HTTPS
- Usar variável de ambiente para forçar HTTPS

---

### 7. **Sanitização de Inputs**
**Problema Atual:** Inputs não são sanitizados.

**Risco:** Possível injeção de código malicioso.

**Solução:** Sanitizar todos os inputs.

**Implementação:**
```bash
npm install dompurify
```

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Em rotas que recebem texto
const sanitizedName = DOMPurify.sanitize(body.name);
```

---

### 8. **Logs de Auditoria**
**Problema Atual:** Não há logs de ações sensíveis.

**Risco:** Dificulta rastreamento de problemas ou ataques.

**Solução:** Implementar logs de auditoria.

**Implementação:**
```typescript
// Criar middleware de auditoria
async function auditLog(request: FastifyRequest, action: string) {
  await prisma.auditLog.create({
    data: {
      userId: request.user?.userId,
      action,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
    },
  });
}

// Usar em rotas sensíveis
fastify.delete('/clients/:id', {
  preHandler: [fastify.authenticate],
}, async (request, reply) => {
  // ... código de deleção
  await auditLog(request, 'DELETE_CLIENT');
  // ...
});
```

---

### 9. **Validação de CORS Mais Restritiva**
**Problema Atual:**
```typescript
origin: process.env.FRONTEND_URL || 'http://localhost:3000'
```

**Risco:** Em produção, pode permitir requisições de origens não autorizadas.

**Solução:** Validar origem em produção.

**Implementação:**
```typescript
await server.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
});
```

---

### 10. **Timeout de Sessão no Frontend**
**Problema Atual:** Token armazenado em `localStorage` sem expiração no frontend.

**Risco:** Token pode ser usado mesmo após expiração.

**Solução:** Verificar expiração do token no frontend.

**Implementação:**
```typescript
// frontend/lib/auth.ts
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Converter para milissegundos
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

// Verificar antes de cada requisição
if (isTokenExpired(token)) {
  localStorage.removeItem('token');
  router.push('/login');
}
```

---

## 📊 Prioridade: BAIXA (Melhorias Futuras)

### 11. **2FA (Autenticação de Dois Fatores)**
- Adicionar verificação por SMS ou app autenticador
- Opcional para usuários

### 12. **Refresh Tokens**
- Tokens de curta duração (15min) + refresh tokens
- Melhor segurança e UX

### 13. **Proteção CSRF**
- Tokens CSRF para formulários
- Validar em rotas POST/PUT/DELETE

### 14. **Content Security Policy (CSP)**
- Headers CSP mais restritivos
- Prevenir XSS

### 15. **Validação de Email**
- Enviar email de confirmação no registro
- Verificar email antes de ativar conta

---

## 🎯 Resumo de Prioridades

### 🔴 **CRÍTICO (Implementar Agora)**
1. ✅ JWT Secret seguro
2. ✅ Rate limiting
3. ✅ Senhas mais fortes
4. ✅ Expiração de tokens

### 🟡 **IMPORTANTE (Próximas Semanas)**
5. ✅ Verificação explícita de establishmentId
6. ✅ HTTPS em produção
7. ✅ Sanitização de inputs
8. ✅ Logs de auditoria

### 🟢 **DESEJÁVEL (Futuro)**
9. ✅ CORS mais restritivo
10. ✅ Timeout de sessão no frontend
11. ✅ 2FA
12. ✅ Refresh tokens

---

## 📝 Notas de Implementação

- **Desenvolvimento vs Produção:** Algumas melhorias (como HTTPS) só fazem sentido em produção
- **Performance:** Rate limiting e validações adicionam latência mínima
- **UX:** Algumas melhorias (senhas fortes) podem impactar UX, mas melhoram segurança
- **Manutenção:** Logs de auditoria aumentam volume de dados, considerar retenção

