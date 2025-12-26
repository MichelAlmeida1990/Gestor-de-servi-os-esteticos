# 💅 BeautyFlow - Sistema de Agendamento e Gestão para Salões de Beleza

**BeautyFlow** - A solução completa para gestão de salões de beleza feminino e salões de manicure.

Sistema completo de gestão para salões de beleza feminino e salões de manicure, incluindo agendamento, gestão de clientes, profissionais, serviços, produtos, financeiro e relatórios.

## 🎯 Foco do Produto

Desenvolvido especificamente para:
- 💇 Salões de beleza feminino
- 💅 Salões de manicure
- ✂️ Estabelecimentos de estética e beleza

## 🚀 Funcionalidades Principais

### Agendamento
- ✅ Agenda visual (semanal/mensal)
- ✅ Agendamento online via widget web
- ✅ Integrações (WhatsApp, Messenger, Instagram)
- ✅ Notificações automáticas (Email/SMS)
- ✅ Lembretes para reduzir faltas

### Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ Histórico de serviços realizados
- ✅ Aniversários e datas importantes
- ✅ Observações e preferências
- ✅ Fidelidade e pacotes

### Gestão de Profissionais
- ✅ Cadastro de profissionais/equipe
- ✅ Horários de trabalho
- ✅ Comissões
- ✅ Serviços por profissional
- ✅ Performance individual

### Gestão de Serviços
- ✅ Cadastro de serviços (corte, escova, manicure, etc.)
- ✅ Categorias (cabelo, unhas, estética, etc.)
- ✅ Duração e preço
- ✅ Profissionais associados
- ✅ Produtos necessários

### Gestão de Produtos
- ✅ Controle de estoque
- ✅ Produtos por serviço
- ✅ Uso por profissional
- ✅ Alertas de estoque baixo
- ✅ Relatórios de consumo

### Financeiro
- ✅ Caixa (abertura/fechamento)
- ✅ Conta corrente
- ✅ Receitas e despesas
- ✅ Comissões de profissionais
- ✅ Relatórios financeiros

### Relatórios
- ✅ Receita (diária/semanal/mensal)
- ✅ Serviços mais vendidos
- ✅ Performance de profissionais
- ✅ Clientes mais frequentes
- ✅ Taxa de comparecimento

## 🛠️ Stack Tecnológica

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- React Hook Form + Zod
- TanStack Query
- Zustand

### Backend
- Node.js 20+
- Fastify
- Prisma
- PostgreSQL
- JWT

### Integrações
- Resend (Email)
- Twilio (SMS/WhatsApp)
- Mercado Pago (Pagamentos)

## 📦 Estrutura do Projeto

```
app-web-agendamento/
├── frontend/          # Next.js App
├── backend/           # Fastify API
├── shared/            # Código compartilhado
└── docs/              # Documentação
```

## 🚀 Como Começar

### Pré-requisitos
- Node.js 20+
- PostgreSQL
- npm ou yarn

### Instalação

```bash
# Instalar dependências do frontend
cd frontend
npm install

# Instalar dependências do backend
cd ../backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Rodar migrations do banco
npx prisma migrate dev

# Iniciar desenvolvimento
npm run dev
```

## 📚 Documentação

- [ROADMAP.md](./ROADMAP.md) - Roadmap completo
- [MVP.md](./MVP.md) - Produto Mínimo Viável
- [DECISOES_TECNICAS.md](./DECISOES_TECNICAS.md) - Decisões técnicas

## 🎨 Paleta de Cores

- **Azul**: #031f5f (primária)
- **Azure**: #00afee (secundária)
- **Rosa neon**: #ca00ca (destaque)
- **Verde amarelado**: #ccff00 (botões)
- **Preto**: #000000 (background)

## 📝 Licença

Proprietário - Todos os direitos reservados

---

**Desenvolvido com ❤️ para salões de beleza**

