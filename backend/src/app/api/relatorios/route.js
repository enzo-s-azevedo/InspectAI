import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const relatorios = await prisma.relatorio.findMany({
      include: {
        placa: { include: { modelo: true } },
        usuarioCriador: { select: { id: true, nome: true, email: true } },
        usuarioUltimoAcesso: { select: { id: true, nome: true, email: true } },
        defeitos: {
          include: { defeito: true },
        },
        imagens: true,
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: relatorios,
      meta: { total: relatorios.length },
      error: null,
    })
  } catch (error) {
    return NextResponse.json({ success: false, data: null, meta: {}, error: error.message }, { status: 500 })
  }
}
