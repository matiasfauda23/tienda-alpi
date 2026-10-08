import { crearEnlaceWhatsApp } from '@/lib/whatsapp';

/** Botón flotante para escribir por WhatsApp. Si no hay número cargado, no se muestra. */
export function BotonWhatsApp({ numero }: { numero: string }) {
  if (!numero) {
    return null;
  }

  return (
    <a
      href={crearEnlaceWhatsApp(numero, '¡Hola Tienda Alpi! Quería hacer una consulta.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed right-5 bottom-5 flex size-14 items-center justify-center rounded-full bg-acento text-white shadow-lg transition-colors hover:bg-acento-oscuro"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
      </svg>
    </a>
  );
}
