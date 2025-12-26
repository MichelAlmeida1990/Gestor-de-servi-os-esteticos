# Dockerfile para deploy no Render
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor porta (Render define PORT automaticamente)
EXPOSE 3001

# Comando de start
CMD ["npm", "start"]

