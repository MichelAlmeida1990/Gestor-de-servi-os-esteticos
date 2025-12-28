# 🎯 MVP - Produto Mínimo Viável

## 📋 Objetivo

Definir o conjunto mínimo de funcionalidades necessárias para lançar o sistema de agendamento e gestão, permitindo que estabelecimentos comecem a usar o produto.

---

## ✅ Funcionalidades Essenciais do MVP

### 1. 🔐 Autenticação e Onboarding
- [x] Registro de usuário (criar conta)
- [x] Login/Logout
- [x] Recuperação de senha
- [x] Criação de estabelecimento (primeiro acesso)
- [x] Perfil básico do usuário

### 2. 👥 Gestão de Clientes
- [x] Cadastro de cliente (nome, telefone, email)
- [x] Listagem de clientes (com busca)
- [x] Edição de cliente
- [x] Visualização de perfil do cliente
- [x] Histórico básico de agendamentos do cliente

### 3. 👨‍💼 Gestão de Profissionais
- [x] Cadastro de profissional
- [x] Listagem de profissionais
- [x] Edição de profissional
- [x] Horários de trabalho básicos
- [x] Associação de serviços ao profissional

### 4. ✂️ Gestão de Serviços
- [x] Cadastro de serviço (nome, duração, preço)
- [x] Listagem de serviços
- [x] Edição de serviço
- [x] Categorias básicas
- [x] Associação de profissionais ao serviço

### 5. 📅 Agenda e Agendamentos
- [x] **Visualização da agenda**
  - Vista semanal
  - Vista mensal
  - Filtros por profissional
- [x] **Criação de agendamento**
  - Seleção de cliente
  - Seleção de serviço
  - Seleção de profissional
  - Seleção de data/hora
  - Validação de disponibilidade
- [x] **Gestão de agendamentos**
  - Edição de agendamento
  - Cancelamento
  - Mudança de status (pendente, confirmado, concluído, cancelado)
- [x] **Visualização de disponibilidade**
  - Horários livres/ocupados
  - Bloqueio de horários

### 6. 🌐 Agendamento Online (Widget Web)
- [x] Página pública de agendamento
- [x] Seleção de serviço
- [x] Seleção de profissional (opcional)
- [x] Seleção de data/hora disponível
- [x] Formulário de dados do cliente
- [x] Confirmação de agendamento
- [x] Integração com agenda interna

### 7. 📧 Notificações Básicas
- [x] Email de confirmação de agendamento
- [x] Email de lembrete (24h antes)
- [x] Templates básicos de email

### 8. 💰 Financeiro Básico
- [x] Registro de pagamento por agendamento
- [x] Histórico de transações
- [x] Relatório básico de receita (diária/semanal/mensal)

---

## ❌ Funcionalidades NÃO Incluídas no MVP

Estas funcionalidades serão desenvolvidas após o MVP:

- ❌ Integrações com WhatsApp/Messenger (Fase 2)
- ❌ SMS (Fase 2)
- ❌ Gestão completa de produtos (Fase 2)
- ❌ Sistema de pacotes (Fase 2)
- ❌ Caixa e conta corrente completa (Fase 2)
- ❌ Relatórios avançados (Fase 2)
- ❌ App mobile (Fase 3)
- ❌ Modo offline (Fase 3)
- ❌ Sincronização em tempo real (Fase 3)
- ❌ Multi-idioma (Fase 4)

---

## 🎨 Interface do MVP

### Dashboard Principal
- **Sidebar** com navegação:
  - Agenda
  - Clientes
  - Profissionais
  - Serviços
  - Relatórios
  - Configurações
- **Header** com:
  - Logo/identificação
  - Notificações (básico)
  - Perfil do usuário
- **Área de conteúdo** principal

### Páginas Essenciais
1. **Agenda** - Calendário com agendamentos
2. **Clientes** - Lista e gestão de clientes
3. **Profissionais** - Lista e gestão de profissionais
4. **Serviços** - Lista e gestão de serviços
5. **Relatórios** - Relatório básico de receita
6. **Configurações** - Configurações básicas do estabelecimento

---

## 🔧 Stack Técnica do MVP

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- React Hook Form + Zod
- TanStack Query
- Zustand (estado global)

### Backend
- Node.js 20+
- Fastify
- Prisma
- PostgreSQL
- JWT para autenticação

### Integrações MVP
- **Email**: Resend (confirmações e lembretes)
- **Pagamentos**: Apenas registro manual (sem gateway)

---

## 📊 Estrutura de Dados Mínima

### Tabelas Essenciais
1. `users` - Usuários do sistema
2. `establishments` - Estabelecimentos
3. `clients` - Clientes
4. `professionals` - Profissionais
5. `services` - Serviços
6. `appointments` - Agendamentos
7. `transactions` - Transações financeiras básicas

### Relacionamentos Mínimos
- User → Establishment (1:N)
- Establishment → Clients (1:N)
- Establishment → Professionals (1:N)
- Establishment → Services (1:N)
- Client → Appointments (1:N)
- Professional → Appointments (1:N)
- Service → Appointments (1:N)
- Appointment → Transaction (1:1)

---

## 🚀 Critérios de Sucesso do MVP

### Funcionalidade
- ✅ Usuário consegue criar conta e estabelecimento
- ✅ Usuário consegue cadastrar clientes, profissionais e serviços
- ✅ Usuário consegue criar agendamentos
- ✅ Cliente consegue agendar online via widget
- ✅ Sistema envia emails de confirmação e lembrete
- ✅ Usuário consegue visualizar relatório básico de receita

### Performance
- ✅ Página carrega em < 3 segundos
- ✅ Ações do usuário respondem em < 1 segundo
- ✅ Agenda renderiza sem travamentos

### Qualidade
- ✅ Zero bugs críticos
- ✅ Interface intuitiva (sem necessidade de tutorial)
- ✅ Responsivo (funciona em mobile)

---

## 📅 Timeline do MVP

### Semana 1-2: Setup e Autenticação
- Setup do projeto
- Design system básico
- Autenticação completa

### Semana 3-4: CRUDs Básicos
- Gestão de clientes
- Gestão de profissionais
- Gestão de serviços

### Semana 5-6: Agenda
- Visualização de agenda
- Criação de agendamentos
- Validação de disponibilidade

### Semana 7-8: Widget e Notificações
- Widget web de agendamento
- Sistema de notificações por email
- Integração completa

### Semana 9-10: Financeiro Básico e Polimento
- Registro de pagamentos
- Relatório básico
- Correções e melhorias
- Testes finais

**Total: 10 semanas para MVP funcional**

---

## 🎯 Próximos Passos Após MVP

1. **Coletar feedback** dos primeiros usuários
2. **Priorizar melhorias** baseadas no uso real
3. **Adicionar integrações** (WhatsApp, SMS)
4. **Desenvolver app mobile**
5. **Expandir funcionalidades** financeiras
6. **Melhorar relatórios** e analytics

---

## 📝 Notas Importantes

- **Foco**: MVP deve ser funcional, não perfeito
- **Prioridade**: Funcionalidades core primeiro
- **Testes**: Testar com usuários reais antes de lançar
- **Iteração**: Melhorar baseado em feedback
- **Documentação**: Documentar APIs e funcionalidades básicas

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2025








