import { NextResponse } from "next/server";
import { buildFigmaExport, writeFigmaExport } from "@/lib/figma";

export async function GET() {
  try {
    const payload = writeFigmaExport();
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Erro ao exportar dados do projeto para o Figma", error);
    return NextResponse.json(
      { error: "Não foi possível gerar o export do Figma." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const payload = writeFigmaExport();
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Erro ao exportar dados do projeto para o Figma", error);
    return NextResponse.json(
      { error: "Não foi possível gerar o export do Figma." },
      { status: 500 },
    );
  }
}
