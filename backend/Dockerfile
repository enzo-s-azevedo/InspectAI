# Usando a versão estável do Node no Alpine (mais leve)
FROM node:20-alpine

WORKDIR /app

# Copiando os arquivos de dependências
COPY package*.json ./

# Instalando as dependências
RUN npm install

# Copiando o resto do código do projeto
COPY . .

# Porta padrão do Next.js/Express
EXPOSE 3000

# Rodando em modo desenvolvimento
CMD ["npm", "run", "dev"]