// src/app/api/placas/route.js
// API Route Example - GET/POST Placas

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/placas
 * Lista todas as placas com seus defeitos associados
 */
export async function GET(request) {
  try {
    const placas = await prisma.placa.findMany({
      include: {
        defeitos: {
          select: {
            id: true,
            codigoInterno: true,
            tipo: true,
            status: true,
            severidade: true,
          },
        },
        inspecoes: {
          orderBy: { criado: 'desc' },
          take: 5,
        },
      },
      orderBy: { criado: 'desc' },
    });

    return NextResponse.json(
      {
        status: 'sucesso',
        data: placas,
        total: placas.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao listar placas:', error);
    return NextResponse.json(
      { status: 'erro', mensagem: 'Erro ao listar placas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/placas
 * Criar nova placa
 * Body: { codigo, descricao?, localizacao? }
 */
export async function POST(request) {
  try {
    const { codigo, descricao, localizacao } = await request.json();

    if (!codigo) {
      return NextResponse.json(
        { status: 'erro', mensagem: 'Código da placa é obrigatório' },
        { status: 400 }
      );
    }

    const novaPlaca = await prisma.placa.create({
      data: { codigo, descricao, localizacao },
    });

    return NextResponse.json(
      {
        status: 'sucesso',
        data: novaPlaca,
        mensagem: `Placa ${codigo} criada com sucesso`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 'erro', mensagem: 'Código de placa já existe' },
        { status: 409 }
      );
    }
    console.error('Erro ao criar placa:', error);
    return NextResponse.json(
      { status: 'erro', mensagem: 'Erro ao criar placa' },
      { status: 500 }
    );
  }
}
