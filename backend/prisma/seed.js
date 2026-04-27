// prisma/seed.js
// Dados iniciais para desenvolvimento

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@inspectai.local' },
    update: {},
    create: {
      email: 'admin@inspectai.local',
      nome: 'Administrador',
      papel: 'admin',
      status: 'ativo',
      avatar: null,
    },
  });

  const funcionario = await prisma.usuario.upsert({
    where: { email: 'funcionario@inspectai.local' },
    update: {},
    create: {
      email: 'funcionario@inspectai.local',
      nome: 'João Silva',
      papel: 'funcionario',
      status: 'ativo',
      avatar: null,
    },
  });

  const inspetor = await prisma.usuario.upsert({
    where: { email: 'inspetor@inspectai.local' },
    update: {},
    create: {
      email: 'inspetor@inspectai.local',
      nome: 'Maria Santos',
      papel: 'inspetor',
      status: 'ativo',
      avatar: null,
    },
  });

  console.log('✓ Usuários criados:', { admin: admin.id, funcionario: funcionario.id, inspetor: inspetor.id });

  // Criar placas
  const placa1 = await prisma.placa.upsert({
    where: { codigo: 'PCB-A001-L1' },
    update: {},
    create: {
      codigo: 'PCB-A001-L1',
      nomeClasse: 'PCB-A001-L1',
      descricao: 'Placa Mãe Linha A',
      localizacao: 'Setor 01 - Prateleira 01',
    },
  });

  const placa2 = await prisma.placa.upsert({
    where: { codigo: 'PCB-B002-L2' },
    update: {},
    create: {
      codigo: 'PCB-B002-L2',
      nomeClasse: 'PCB-B002-L2',
      descricao: 'Controladora Linha B',
      localizacao: 'Setor 02 - Prateleira 02',
    },
  });

  const placa3 = await prisma.placa.upsert({
    where: { codigo: 'PCB-C003-L3' },
    update: {},
    create: {
      codigo: 'PCB-C003-L3',
      nomeClasse: 'PCB-C003-L3',
      descricao: 'Power Supply Linha C',
      localizacao: 'Setor 03 - Prateleira 03',
    },
  });

  console.log('✓ Placas criadas:', { placa1: placa1.codigo, placa2: placa2.codigo, placa3: placa3.codigo });

  // Criar defeitos de exemplo
  const defeito1 = await prisma.defeito.upsert({
    where: { codigoInterno: 'DEF-0001' },
    update: {},
    create: {
      codigoInterno: 'DEF-0001',
      idPlacaOrigem: placa1.id,
      classe: 'rachadura',
      nomeArquivoOrigem: 'seed-pcb-a001.png',
      tipo: 'rachadura',
      componente: 'Capacitor C10',
      origem: 'automatico',
      severidade: 'media',
      descricao: 'Rachadura detectada pelo YOLO',
      status: 'aberto',
      placaId: placa1.id,
      usuarioId: inspetor.id,
    },
  });

  const defeito2 = await prisma.defeito.upsert({
    where: { codigoInterno: 'DEF-0002' },
    update: {},
    create: {
      codigoInterno: 'DEF-0002',
      idPlacaOrigem: placa2.id,
      classe: 'oxidacao',
      nomeArquivoOrigem: 'seed-pcb-b002.png',
      tipo: 'oxidacao',
      componente: 'Trilha de cobre',
      origem: 'manual',
      severidade: 'alta',
      descricao: 'Oxidação visível na trilha',
      status: 'em-analise',
      placaId: placa2.id,
      usuarioId: inspetor.id,
    },
  });

  console.log('✓ Defeitos criados:', { defeito1: defeito1.codigoInterno, defeito2: defeito2.codigoInterno });

  // Criar relatório
  const relatorio = await prisma.relatorio.upsert({
    where: { codigoInterno: 'REL-001' },
    update: {},
    create: {
      codigoInterno: 'REL-001',
      titulo: 'Inspeção PCB-A001-L1 - Abril 2026',
      descricao: 'Inspeção de qualidade realizada em 09/04/2026',
      origem: 'inspecao',
      status: 'finalizado',
      usuarioId: funcionario.id,
      defeitos: {
        create: [
          {
            defeitoId: defeito1.id,
            notas: 'Necessário reparo da peça',
          },
          {
            defeitoId: defeito2.id,
            notas: 'Aplicar limpeza eletroquímica',
          },
        ],
      },
    },
  });

  console.log('✓ Relatório criado:', relatorio.codigoInterno);

  // Criar inspeção
  let inspecao = await prisma.inspecao.findFirst({
    where: {
      placaId: placa1.id,
      usuarioId: inspetor.id,
      descricao: 'Inspeção visual da placa PCB-A001-L1',
    },
  });

  if (!inspecao) {
    inspecao = await prisma.inspecao.create({
      data: {
        tipo: 'manual',
        descricao: 'Inspeção visual da placa PCB-A001-L1',
        status: 'concluida',
        placaId: placa1.id,
        usuarioId: inspetor.id,
        concluido: new Date(),
        defeitos: {
          connect: [{ id: defeito1.id }],
        },
      },
    });
  }

  console.log('✓ Inspeção criada:', inspecao.id);

  console.log('\n✅ Seed concluído com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro durante seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
