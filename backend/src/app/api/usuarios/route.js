import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET — lista todos os usuários
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        criadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    })
    return NextResponse.json({ success: true, data: usuarios, meta: { total: usuarios.length }, error: null })
  } catch (error) {
    return NextResponse.json({ success: false, data: null, meta: {}, error: error.message }, { status: 500 })
  }
}

// POST — cria novo usuário
export async function POST(request) {
  try {
    const body = await request.json()
    const { nome, email, senha, cargo } = body

    if (!nome || !email || !senha || !cargo) {
      return NextResponse.json({ success: false, data: null, meta: {}, error: 'Campos obrigatórios: nome, email, senha, cargo' }, { status: 400 })
    }

    if (!['ADMINISTRADOR', 'FUNCIONARIO'].includes(cargo.toUpperCase())) {
      return NextResponse.json({ success: false, data: null, meta: {}, error: 'Cargo inválido. Use ADMINISTRADOR ou FUNCIONARIO' }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(senha, 12)

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        cargo: cargo.toUpperCase(),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        criadoEm: true,
      },
    })

    return NextResponse.json({ success: true, data: usuario, meta: {}, error: null }, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, data: null, meta: {}, error: 'Email já cadastrado' }, { status: 400 })
    }
    return NextResponse.json({ success: false, data: null, meta: {}, error: error.message }, { status: 500 })
  }
}
