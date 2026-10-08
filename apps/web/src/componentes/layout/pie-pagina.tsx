import Link from 'next/link';
import type { Contacto } from '@/lib/api/tipos';
import { crearEnlaceWhatsApp } from '@/lib/whatsapp';
import { Logo } from '../ui/logo';

/** Pie de página con contacto, redes y links de información. */
export function PiePagina({ contacto }: { contacto: Contacto }) {
  return (
    <footer className="mt-16 border-t border-borde bg-superficie">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-texto-suave">Fabricantes de mates térmicos, vasos y bombillas.</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <h2 className="font-bold">Contacto</h2>
          {contacto.whatsapp && (
            <a href={crearEnlaceWhatsApp(contacto.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-acento hover:underline">
              WhatsApp
            </a>
          )}
          {contacto.email && (
            <a href={`mailto:${contacto.email}`} className="text-acento hover:underline">
              {contacto.email}
            </a>
          )}
          {contacto.instagram && (
            <a href={`https://instagram.com/${contacto.instagram}`} target="_blank" rel="noopener noreferrer" className="text-acento hover:underline">
              Instagram @{contacto.instagram}
            </a>
          )}
          {contacto.tiktok && (
            <a href={`https://www.tiktok.com/@${contacto.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-acento hover:underline">
              TikTok @{contacto.tiktok}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <h2 className="font-bold">Información</h2>
          <Link href="/condiciones" className="text-acento hover:underline">Condiciones de venta</Link>
          <Link href="/preguntas-frecuentes" className="text-acento hover:underline">Preguntas frecuentes</Link>
          {/* PENDIENTE: confirmar con Marce los links oficiales de arrepentimiento y defensa del consumidor */}
          <Link href="/condiciones#arrepentimiento" className="text-acento hover:underline">Botón de arrepentimiento</Link>
          <Link href="/condiciones#defensa-del-consumidor" className="text-acento hover:underline">Defensa de las y los consumidores</Link>
        </div>
      </div>

      <p className="border-t border-borde px-4 py-6 text-center text-xs text-texto-suave">Tienda Alpi</p>
    </footer>
  );
}
