import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET — busca usuário por id
export async function GET(request, { params }) {
  try {
    const { id } = await params // <-- AQUI: await params
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        criadoEm: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ success: false, data: null, meta: {}, error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: usuario, meta: {}, error: null })
  } catch (error) {
    return NextResponse.json({ success: false, data: null, meta: {}, error: error.message }, { status: 500 })
  }
}

// PUT — edita usuário
export async function PUT(request, { params }) {
  try {
    const { id } = await params // <-- AQUI: await params
    const body = await request.json()
    const { nome, email, senha, cargo } = body

    const updateData = {}
    if (nome) updateData.nome = nome
    if (email) updateData.email = email
    if (cargo) {
      if (!['ADMINISTRADOR', 'FUNCIONARIO'].includes(cargo.toUpperCase())) {
        return NextResponse.json({ success: false, data: null, meta: {}, error: 'Cargo inválido. Use ADMINISTRADOR ou FUNCIONARIO' }, { status: 400 })
      }
      updateData.cargo = cargo.toUpperCase()
    }
    if (senha) updateData.senhaHash = await bcrypt.hash(senha, 12)

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        criadoEm: true,
      },
    })

    return NextResponse.json({ success: true, data: usuario, meta: {}, error: null })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, data: null, meta: {}, error: 'Usuário não encontrado' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, data: null, meta: {}, error: 'Email já cadastrado' }, { status: 400 })
    }
    return NextResponse.json({ success: false, data: null, meta: {}, error: error.message }, { status: 500 })
  }
}

// DELETE — remove usuário
export async function DELETE(request, { params }) {
  try {
    const { id } = await params // <-- AQUI: await params

    await prisma.usuario.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true, data: { message: 'Usuário removido com sucesso' }, meta: {}, error: null })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, data: null, meta: {}, error: 'Usuário não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: false, data: null, meta: {}, error: error.message }, { status: 500 })
  }
}