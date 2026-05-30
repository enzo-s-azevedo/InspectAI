import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REQUIRED_TABLES = [
  'modelo',
  'placa',
  'defeito',
  'usuario',
  'relatorio',
  'relatorio_defeito',
  'relatorio_imagem',
];

const runIfDatabaseUrl = process.env.DATABASE_URL ? describe : describe.skip;

runIfDatabaseUrl('Neon schema e relatorios', () => {
  const suffix = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const modeloCodigo = `IT-${suffix}`;
  const usuarioEmail = `relatorio-${suffix}@inspectai.test`;

  let usuarioId;
  let placaId;
  let defeitoId;
  let relatorioId;

  afterAll(async () => {
    if (relatorioId) {
      await prisma.relatorio.deleteMany({ where: { id: relatorioId } });
    }
    if (defeitoId) {
      await prisma.defeito.deleteMany({ where: { id: defeitoId } });
    }
    if (placaId) {
      await prisma.placa.deleteMany({ where: { id: placaId } });
    }
    if (usuarioId) {
      await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    }
    await prisma.modelo.deleteMany({ where: { codigo: modeloCodigo } });
    await prisma.$disconnect();
  });

  it('possui todas as tabelas esperadas no schema public', async () => {
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `;

    const tableNames = new Set(tables.map((item) => item.table_name));
    for (const tableName of REQUIRED_TABLES) {
      expect(tableNames.has(tableName)).toBe(true);
    }
  });

  it('mantem somente a migration consolidada no historico do Prisma', async () => {
    const migrations = await prisma.$queryRaw`
      SELECT migration_name
      FROM _prisma_migrations
      ORDER BY migration_name
    `;

    expect(migrations.map((item) => item.migration_name)).toEqual(['0001_init']);
  });

  it('cria relatorio associado ao usuario, placa, imagem e defeito', async () => {
    const result = await prisma.$transaction(async (client) => {
      const modelo = await client.modelo.create({
        data: { codigo: modeloCodigo },
      });

      const usuario = await client.usuario.create({
        data: {
          nome: 'Integracao Relatorio',
          email: usuarioEmail,
          senhaHash: 'hash-test',
          cargo: 'FUNCIONARIO',
        },
      });

      const placa = await client.placa.create({
        data: { modeloCodigo: modelo.codigo },
      });

      const relatorio = await client.relatorio.create({
        data: {
          placaId: placa.id,
          idUsuarioCriador: usuario.id,
        },
      });

      const imagem = await client.relatorioImagem.create({
        data: {
          relatorioId: relatorio.id,
          caminhoImagem: 'integracao/placa-a.png',
          tipo: 'original',
        },
      });

      const defeito = await client.defeito.create({
        data: {
          placaId: placa.id,
          classeDefeito: 'trinca',
          statusConfirmacao: 'confirmado',
          tipo: 'imagem',
          dataHora: null,
        },
      });

      const relatorioDefeito = await client.relatorioDefeito.create({
        data: {
          relatorioId: relatorio.id,
          defeitoId: defeito.id,
        },
      });

      return { usuario, placa, relatorio, imagem, defeito, relatorioDefeito };
    });

    usuarioId = result.usuario.id;
    placaId = result.placa.id;
    defeitoId = result.defeito.id;
    relatorioId = result.relatorio.id;

    const relatorioCompleto = await prisma.relatorio.findUnique({
      where: { id: relatorioId },
      include: {
        placa: true,
        usuarioCriador: true,
        imagens: true,
        defeitos: {
          include: {
            defeito: true,
          },
        },
      },
    });

    expect(relatorioCompleto).toMatchObject({
      id: relatorioId,
      placaId,
      idUsuarioCriador: usuarioId,
      usuarioCriador: {
        email: usuarioEmail,
      },
      placa: {
        modeloCodigo,
      },
    });
    expect(relatorioCompleto.imagens).toHaveLength(1);
    expect(relatorioCompleto.imagens[0]).toMatchObject({
      caminhoImagem: 'integracao/placa-a.png',
      tipo: 'original',
    });
    expect(relatorioCompleto.defeitos).toHaveLength(1);
    expect(relatorioCompleto.defeitos[0].defeito).toMatchObject({
      classeDefeito: 'trinca',
      placaId,
    });
  });
});
