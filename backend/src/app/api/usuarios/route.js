// src/app/api/usuarios/route.js
// API Route Example - GET/POST Usuários

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/usuarios
 * Lista todos os usuários
 * Query params: papel=admin|funcionario|inspetor, status=ativo|inativo
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const papel = searchParams.get('papel');
    const status = searchParams.get('status');

    const where = {};
    if (papel) where.papel = papel;
    if (status) where.status = status;

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        status: true,
        criado: true,
        atualizado: true,
      },
      orderBy: { criado: 'desc' },
    });

    return NextResponse.json(
      {
        status: 'sucesso',
        data: usuarios,
        total: usuarios.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { status: 'erro', mensagem: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usuarios
 * Criar novo usuário
 * Body: { email, nome, papel?, status? }
 */
export async function POST(request) {
  try {
    const { email, nome, papel, status } = await request.json();

    if (!email || !nome) {
      return NextResponse.json(
        { status: 'erro', mensagem: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    const novoUsuario = await prisma.usuario.create({
      data: {
        email,
        nome,
        papel: papel || 'funcionario',
        status: status || 'ativo',
      },
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        status: 'sucesso',
        data: novoUsuario,
        mensagem: 'Usuário criado com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 'erro', mensagem: 'Email já cadastrado' },
        { status: 409 }
      );
    }
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { status: 'erro', mensagem: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
