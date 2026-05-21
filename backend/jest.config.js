const nextJest = require('next/jest');

// Diz ao Next.js onde está o projeto para ele carregar as configurações (.env, atalhos, etc)
const createJestConfig = nextJest({
  dir: './',
});

// Configuração customizada do Jest para a API
const customJestConfig = {
  // Como estamos testando o backend/API, o ambiente TEM que ser 'node' (e não 'jsdom' como no frontend)
  testEnvironment: 'node',
};

// Exporta a configuração traduzida pelo Next.js
module.exports = createJestConfig(customJestConfig);