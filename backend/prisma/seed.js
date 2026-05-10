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

  // Criar modelos
  const modeloA = await prisma.modelo.upsert({
    where: { codigo: 'PCB-A001-L1' },
    update: {},
    create: {
      codigo: 'PCB-A001-L1',
      descricao: 'Modelo Placa Mae Linha A',
    },
  });

  const modeloB = await prisma.modelo.upsert({
    where: { codigo: 'PCB-B002-L2' },
    update: {},
    create: {
      codigo: 'PCB-B002-L2',
      descricao: 'Modelo Controladora Linha B',
    },
  });

  const modeloC = await prisma.modelo.upsert({
    where: { codigo: 'PCB-C003-L3' },
    update: {},
    create: {
      codigo: 'PCB-C003-L3',
      descricao: 'Modelo Power Supply Linha C',
    },
  });

  console.log('✓ Modelos criados:', { modeloA: modeloA.codigo, modeloB: modeloB.codigo, modeloC: modeloC.codigo });

  // Criar placas
  const placa1 = await prisma.placa.upsert({
    where: { codigo: 'PCB-A001-L1' },
    update: {},
    create: {
      codigo: 'PCB-A001-L1',
      modeloCodigo: modeloA.codigo,
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
      modeloCodigo: modeloB.codigo,
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
      modeloCodigo: modeloC.codigo,
      nomeClasse: 'PCB-C003-L3',
      descricao: 'Power Supply Linha C',
      localizacao: 'Setor 03 - Prateleira 03',
    },
  });

  console.log('✓ Placas criadas:', { placa1: placa1.codigo, placa2: placa2.codigo, placa3: placa3.codigo });

  // Criar defeitos de exemplo
  let defeito1 = await prisma.defeito.findFirst({
    where: {
      idPlaca: placa1.id,
      classeDefeito: 'rachadura',
      nomeArquivoOrigem: 'seed-pcb-a001.png',
    },
  });

  if (!defeito1) {
    defeito1 = await prisma.defeito.create({
      data: {
        idPlaca: placa1.id,
        classeDefeito: 'rachadura',
        nomeArquivoOrigem: 'seed-pcb-a001.png',
        componente: 'Capacitor C10',
        origem: 'automatico',
        descricao: 'Rachadura detectada pelo YOLO',
        confirmado: true,
        usuarioId: inspetor.id,
      },
    });
  }

  let defeito2 = await prisma.defeito.findFirst({
    where: {
      idPlaca: placa2.id,
      classeDefeito: 'oxidacao',
      nomeArquivoOrigem: 'seed-pcb-b002.png',
    },
  });

  if (!defeito2) {
    defeito2 = await prisma.defeito.create({
      data: {
        idPlaca: placa2.id,
        classeDefeito: 'oxidacao',
        nomeArquivoOrigem: 'seed-pcb-b002.png',
        componente: 'Trilha de cobre',
        origem: 'manual',
        descricao: 'Oxidação visível na trilha',
        confirmado: true,
        usuarioId: inspetor.id,
      },
    });
  }

  console.log('✓ Defeitos criados:', { defeito1: defeito1.id, defeito2: defeito2.id });

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
