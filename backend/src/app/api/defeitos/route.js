import { NextResponse } from 'next/server';

export async function GET() {
  // Dados mockados para teste
  const defeitos = [
    { id: 1, tipo: "Solda Fria", total: 15 },
    { id: 2, tipo: "Curto-circuito", total: 8 }
  ];

  return NextResponse.json(defeitos);
}