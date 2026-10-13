import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { esTokenValido, leerEtiquetas } from '@/lib/revalidacion';

/** Recibe el aviso de la API cuando cambian datos y vence la caché de esas etiquetas. */
export async function POST(pedido: NextRequest) {
  if (!esTokenValido(pedido.headers.get('authorization'), process.env.REVALIDACION_SECRETO)) {
    return NextResponse.json({ mensaje: 'No autorizado.' }, { status: 401 });
  }

  const etiquetas = leerEtiquetas(await pedido.json().catch(() => null));
  if (etiquetas.length === 0) {
    return NextResponse.json({ mensaje: 'No se indicaron etiquetas válidas.' }, { status: 400 });
  }

  for (const etiqueta of etiquetas) revalidateTag(etiqueta, { expire: 0 });
  return NextResponse.json({ revalidadas: etiquetas });
}
