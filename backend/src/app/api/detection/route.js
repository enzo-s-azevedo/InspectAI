import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    }

    // Simulação: Aqui no futuro você conectará com sua IA
    return NextResponse.json({ 
      status: "sucesso",
      message: "Imagem recebida para análise",
      detections: [] 
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}