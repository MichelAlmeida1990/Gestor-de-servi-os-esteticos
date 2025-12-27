# 🔧 Decisões Técnicas - Sistema de Agendamento Web

## 📊 Análise Comparativa: ilove.me vs. Nossa Solução

### Pontos Fortes do ilove.me (a manter/melhorar)
✅ Landing page bem estruturada e informativa  
✅ Integração multi-canal (WhatsApp, Messenger, etc.)  
✅ Sistema completo de gestão  
✅ App mobile disponível  
✅ Modo offline  

### Pontos Fracos do ilove.me (a melhorar)
❌ Performance pode ser otimizada  
❌ UI/UX pode ser mais moderna  
❌ Stack tecnológica mais antiga  
❌ Falta de recursos de IA/ML  

---

## 🎯 Nossa Estratégia de Diferenciação

### 1. Performance Superior
- **Next.js 14+** com App Router (melhor que React puro)
- **Server Components** para reduzir JavaScript no cliente
- **Otimização de imagens** automática
- **CDN** para assets estáticos
- **Cache inteligente** com React Query

### 2. UX/UI Moderna
- **Shadcn/ui** - Componentes modernos e acessíveis
- **Tailwind CSS** - Estilização rápida e consistente
- **Framer Motion** - Animações suaves
- **Dark mode** nativo
- **Design system** completo

### 3. Tecnologia de Ponta
- **TypeScript** em todo o projeto
- **Prisma** - ORM moderno e type-safe
- **Zod** - Validação em runtime e compile-time
- **TanStack Query** - Gerenciamento de estado servidor
- **WebSockets** - Sincronização em tempo real

### 4. Funcionalidades Extras
- **IA/ML** para previsões e recomendações
- **Chat interno** para comunicação
- **Programa de fidelidade** integrado
- **Multi-idioma** desde o início
- **API pública** para integrações

---

## 🛠️ Stack Tecnológica Detalhada

### Frontend

#### Framework: Next.js 14+
**Por quê?**
- SSR/SSG para melhor SEO
- App Router para melhor organização
- Server Components para performance
- API Routes integradas
- Otimizações automáticas

**Alternativas consideradas:**
- Remix (menos popular, menos recursos)
- SvelteKit (ecossistema menor)

#### Estilização: Tailwind CSS + Shadcn/ui
**Por quê?**
- Desenvolvimento rápido
- Design system consistente
- Componentes acessíveis
- Customização fácil
- Performance otimizada

**Alternativas consideradas:**
- Material-UI (mais pesado, menos customizável)
- Chakra UI (menos componentes prontos)

#### Animações: Framer Motion
**Por quê?**
- API simples e poderosa
- Performance otimizada
- Animações suaves
- Suporte a gestos

#### Formulários: React Hook Form + Zod
**Por quê?**
- Performance (menos re-renders)
- Validação type-safe
- Integração fácil
- Mensagens de erro claras

#### Estado: Zustand
**Por quê?**
- Simples e leve
- TypeScript nativo
- Menos boilerplate que Redux
- Performance excelente

**Alternativas consideradas:**
- Redux Toolkit (mais complexo)
- Jotai (menos popular)

#### Requisições: TanStack Query
**Por quê?**
- Cache automático
- Sincronização em background
- Otimistic updates
- DevTools excelentes

---

### Backend

#### Runtime: Node.js 20+
**Por quê?**
- Mesma linguagem do frontend
- Ecossistema rico
- Performance melhorada
- Suporte a ESM

#### Framework: Fastify
**Por quê?**
- Mais rápido que Express
- TypeScript nativo
- Validação integrada
- Plugins modulares

**Alternativas consideradas:**
- Express (mais popular, mas mais lento)
- NestJS (mais complexo, overkill para MVP)

#### ORM: Prisma
**Por quê?**
- Type-safe
- Migrations fáceis
- DevTools excelentes
- Suporte a múltiplos bancos

**Alternativas consideradas:**
- TypeORM (menos type-safe)
- Sequelize (menos moderno)

#### Banco de Dados: PostgreSQL
**Por quê?**
- Relacional robusto
- Suporte a JSON
- Performance excelente
- Open source

**Alternativas consideradas:**
- MySQL (menos recursos)
- MongoDB (menos estruturado para este caso)

#### Cache: Redis
**Por quê?**
- Performance
- Sessões
- Filas
- Pub/Sub

---

### Mobile

#### Framework: Expo (React Native)
**Por quê?**
- Desenvolvimento rápido
- Hot reload
- Over-the-air updates
- Sem necessidade de build nativo inicialmente

**Alternativas consideradas:**
- React Native CLI (mais complexo)
- Flutter (linguagem diferente)

---

### Integrações

#### WhatsApp: Twilio ou WhatsApp Business API
**Twilio:**
- ✅ Mais fácil de configurar
- ✅ Suporte a múltiplos países
- ❌ Mais caro

**WhatsApp Business API:**
- ✅ Oficial
- ✅ Mais barato
- ❌ Mais complexo de configurar

**Decisão**: Começar com Twilio para MVP, migrar para WhatsApp Business API depois

#### Email: Resend
**Por quê?**
- API simples
- Templates React
- Preço justo
- Developer-friendly

**Alternativas consideradas:**
- SendGrid (mais complexo)
- AWS SES (menos developer-friendly)

#### SMS: Twilio
**Por quê?**
- Mesma plataforma do WhatsApp
- Confiável
- API simples
- Suporte global

#### Pagamentos: Stripe ou Mercado Pago
**Stripe:**
- ✅ Internacional
- ✅ Developer-friendly
- ❌ Taxas mais altas no Brasil

**Mercado Pago:**
- ✅ Popular no Brasil
- ✅ Taxas menores
- ❌ Menos recursos

**Decisão**: Suportar ambos, começar com Mercado Pago no Brasil

---

### DevOps

#### Frontend Hosting: Vercel
**Por quê?**
- Criado pelos mesmos do Next.js
- Deploy automático
- CDN global
- Preview deployments
- Grátis para começar

**Alternativas consideradas:**
- Netlify (similar, mas menos integrado com Next.js)
- Cloudflare Pages (menos features)

#### Backend Hosting: Railway ou Render
**Railway:**
- ✅ Simples
- ✅ Deploy automático
- ✅ Banco incluído
- ✅ Preço justo

**Render:**
- ✅ Similar ao Railway
- ✅ Free tier generoso

**Decisão**: Railway para começar (mais simples)

#### Banco de Dados: Supabase ou Neon
**Supabase:**
- ✅ PostgreSQL gerenciado
- ✅ Auth incluído
- ✅ Storage incluído
- ✅ Real-time incluído

**Neon:**
- ✅ PostgreSQL serverless
- ✅ Branching de banco
- ✅ Mais barato

**Decisão**: Supabase para começar (mais features), considerar Neon depois

#### CDN: Cloudflare
**Por quê?**
- Grátis
- Performance excelente
- DDoS protection
- Analytics

---

## 📱 Estrutura de Dados (Prisma Schema - Preview)

```prisma
// Usuário do sistema
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  name          String
  role          Role     @default(OWNER)
  establishments Establishment[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Estabelecimento (salão, clínica, etc.)
model Establishment {
  id            String   @id @default(cuid())
  name          String
  ownerId       String
  owner         User     @relation(fields: [ownerId], references: [id])
  clients       Client[]
  professionals Professional[]
  services      Service[]
  appointments  Appointment[]
  products      Product[]
  packages      Package[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Cliente
model Client {
  id            String   @id @default(cuid())
  name          String
  email         String?
  phone         String
  birthDate     DateTime?
  notes         String?
  establishmentId String
  establishment Establishment @relation(fields: [establishmentId], references: [id])
  appointments  Appointment[]
  transactions  Transaction[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Profissional/Equipe
model Professional {
  id            String   @id @default(cuid())
  name          String
  email         String?
  phone         String
  services      Service[] @relation("ProfessionalServices")
  appointments  Appointment[]
  commission    Float    @default(0)
  establishmentId String
  establishment Establishment @relation(fields: [establishmentId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Serviço
model Service {
  id            String   @id @default(cuid())
  name          String
  description   String?
  duration      Int      // em minutos
  price         Float
  category      String?
  professionals Professional[] @relation("ProfessionalServices")
  establishmentId String
  establishment Establishment @relation(fields: [establishmentId], references: [id])
  appointments  Appointment[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Agendamento
model Appointment {
  id            String   @id @default(cuid())
  clientId      String
  client        Client   @relation(fields: [clientId], references: [id])
  serviceId     String
  service       Service  @relation(fields: [serviceId], references: [id])
  professionalId String?
  professional  Professional? @relation(fields: [professionalId], references: [id])
  startTime     DateTime
  endTime       DateTime
  status        AppointmentStatus @default(PENDING)
  notes         String?
  source        AppointmentSource @default(MANUAL) // MANUAL, WHATSAPP, MESSENGER, etc.
  establishmentId String
  establishment Establishment @relation(fields: [establishmentId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Produto
model Product {
  id            String   @id @default(cuid())
  name          String
  description   String?
  price         Float
  stock         Int      @default(0)
  establishmentId String
  establishment Establishment @relation(fields: [establishmentId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Pacote
model Package {
  id            String   @id @default(cuid())
  name          String
  description   String?
  services      Service[]
  price         Float
  sessions      Int
  validityDays  Int?
  establishmentId String
  establishment Establishment @relation(fields: [establishmentId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Transação Financeira
model Transaction {
  id            String   @id @default(cuid())
  type          TransactionType // INCOME, EXPENSE
  amount        Float
  description   String?
  clientId      String?
  client        Client? @relation(fields: [clientId], references: [id])
  establishmentId String
  establishment Establishment @relation(fields: [establishmentId], references: [id])
  createdAt     DateTime @default(now())
}

enum Role {
  OWNER
  MANAGER
  PROFESSIONAL
  RECEPTIONIST
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum AppointmentSource {
  MANUAL
  WHATSAPP
  MESSENGER
  INSTAGRAM
  GOOGLE
  FACEBOOK
  WIDGET
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

---

## 🔐 Segurança

### Autenticação
- **JWT** para tokens de acesso
- **Refresh tokens** para segurança
- **Rate limiting** para prevenir brute force
- **2FA** (opcional, futuro)

### Validação
- **Zod** em todas as entradas
- **Sanitização** de inputs
- **SQL injection** prevenido pelo Prisma
- **XSS** prevenido pelo React

### Autorização
- **RBAC** (Role-Based Access Control)
- **Middleware** de autorização
- **Row-level security** no banco

---

## 📈 Escalabilidade

### Estratégias
1. **Horizontal scaling** do backend
2. **Database connection pooling**
3. **Redis** para cache e sessões
4. **CDN** para assets estáticos
5. **Queue system** para tarefas pesadas (Bull/BullMQ)

### Monitoramento
- **Sentry** para erros
- **Axiom/Logtail** para logs
- **Uptime monitoring** (UptimeRobot)
- **Performance monitoring** (Vercel Analytics)

---

## 🚀 Plano de Ação Imediato

### Semana 1
1. ✅ Criar roadmap (FEITO)
2. ⏳ Setup do projeto Next.js
3. ⏳ Configurar Tailwind + Shadcn
4. ⏳ Criar estrutura de pastas
5. ⏳ Setup do Git/GitHub

### Semana 2
1. ⏳ Design system básico
2. ⏳ Componentes base
3. ⏳ Landing page - estrutura
4. ⏳ Hero section

---

## ❓ Decisões Pendentes

1. **Nome do produto** - Definir nome final
2. **Domínio** - Registrar domínio
3. **Logo** - Criar/contratar logo
4. **Hosting final** - Confirmar escolhas
5. **Integrações prioritárias** - Definir ordem

---

**Última atualização**: Janeiro 2025





