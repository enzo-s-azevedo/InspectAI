import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// Em ambiente de produção, esta chave deve estar no ficheiro .env
const JWT_SECRET = process.env.JWT_SECRET || 'inspectai-chave-super-secreta-2026'; 

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    // 1. Validação dos dados
    if (!email || !senha) {
      return NextResponse.json(
        { success: false, error: 'O email e a senha são obrigatórios' }, 
        { status: 400 }
      );
    }

    // 2. Procura o utilizador na base de dados
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Se não encontrar, devolvemos erro genérico por segurança
    if (!usuario) {
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 });
    }

    // 3. Compara a senha digitada com a senha encriptada
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 });
    }

    // 4. Gera o Token JWT com o ID e o Cargo
    const token = jwt.sign(
      { id: usuario.id, cargo: usuario.cargo },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 5. Prepara a resposta de sucesso
    const response = NextResponse.json({
      success: true,
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        token: token // Enviamos o token também no corpo para facilitar os testes no Swagger
      }
    }, { status: 200 });

    // 6. Guarda o Token num Cookie seguro
    response.cookies.set({
      name: 'inspectai_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar o login' }, 
      { status: 500 }
    );
  }
}