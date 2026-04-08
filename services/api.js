// services/api.js

// 1. O nosso "Banco de Dados" falso
const db = {
  defeitos: [
    { id: '#DEF-0312', placa: 'PCB-A001-L3', tipo: 'Solda fria', componente: 'Resistor SMD', origem: 'Imagem', status: 'critical', statusLabel: 'Crítico', data: '15/01/2025 14:31' },
    { id: '#DEF-0311', placa: 'PCB-B047-L1', tipo: 'Curto-circuito', componente: 'Capacitor', origem: 'Vídeo', status: 'critical', statusLabel: 'Crítico', data: '15/01/2025 14:28' },
    { id: '#DEF-0310', placa: 'PCB-A002-L3', tipo: 'Componente ausente', componente: 'IC Chip', origem: 'Imagem', status: 'warning', statusLabel: 'Aviso', data: '15/01/2025 14:22' },
    { id: '#DEF-0309', placa: 'PCB-C011-L2', tipo: 'Desalinhamento', componente: 'Transistor', origem: 'Lote', status: 'neutral', statusLabel: 'Falso Pos.', data: '15/01/2025 14:17' },
    { id: '#DEF-0308', placa: 'PCB-A003-L3', tipo: 'Oxidação', componente: 'Trilha PCB', origem: 'Imagem', status: 'success', statusLabel: 'Validado', data: '15/01/2025 14:09' },
    { id: '#DEF-0307', placa: 'PCB-B050-L1', tipo: 'Excesso de solda', componente: 'Resistor SMD', origem: 'Vídeo', status: 'warning', statusLabel: 'Aviso', data: '15/01/2025 14:01' },
  ],
  imagensInspecoes: [
    { id: 'DEF-01', tipo: 'Solda fria', confianca: 94.2, regiao: '(108, 68)', status: 'critical', statusLabel: 'Crítico' },
    { id: 'DEF-02', tipo: 'Desalinhamento de componente', confianca: 81.7, regiao: '(268,108)', status: 'warning', statusLabel: 'Aviso' },
    { id: 'DEF-03', tipo: 'Curto-circuito', confianca: 97.1, regiao: '(48, 246)', status: 'critical', statusLabel: 'Crítico' },
  ],
  relatorios: [
    { id: 'REL-024', titulo: 'Lote B-047 — Inspeção completa', origem: 'Lote', defeitos: 12, data: '15/01/2025 14:30', status: 'success', statusLabel: 'Gerado' },
    { id: 'REL-023', titulo: 'Relatório semanal — Semana 02', origem: 'Semanal', defeitos: 89, data: '13/01/2025 13:00', status: 'success', statusLabel: 'Gerado' },
    { id: 'REL-022', titulo: 'PCB-A001-L3 — Análise de imagem', origem: 'Imagem', defeitos: 3, data: '13/01/2025 11:22', status: 'success', statusLabel: 'Gerado' },
    { id: 'REL-021', titulo: 'Lote A-030 — Inspeção completa', origem: 'Lote', defeitos: 7, data: '12/01/2025 16:50', status: 'neutral', statusLabel: 'Rascunho' },
  ],
  usuarios: [
    { id: 1, nome: 'José Leandro', email: 'jose.leandro@inspect.ai', papel: 'Administrador', status: 'success', statusLabel: 'Ativo', avatar: 'JL', criado: '10/01/2025' },
    { id: 2, nome: 'Ana Silva', email: 'ana.silva@inspect.ai', papel: 'Funcionário', status: 'success', statusLabel: 'Ativo', avatar: 'AS', criado: '15/01/2025' },
    { id: 3, nome: 'Carlos Mendes', email: 'carlos.mendes@inspect.ai', papel: 'Funcionário', status: 'neutral', statusLabel: 'Inativo', avatar: 'CM', criado: '08/01/2025' },
    { id: 4, nome: 'Beatriz Costa', email: 'beatriz.costa@inspect.ai', papel: 'Administrador', status: 'success', statusLabel: 'Ativo', avatar: 'BC', criado: '05/01/2025' },
  ]
}

// 2. Função para simular o "lag" da internet
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 3. A nossa API Falsa exportada
export const api = {
  getDefeitos: async () => {
    await delay(800) // Simula 0.8s carregando
    return db.defeitos
  },
  getRelatorios: async () => {
    await delay(600)
    return db.relatorios
  },
  getUsuarios: async () => {
    await delay(500)
    return db.usuarios
  },
  // Simula o processamento pesado da IA na tela de Imagens
  analisarImagem: async () => {
    await delay(2500) // 2.5s pensando...
    return db.imagensInspecoes
  }
}