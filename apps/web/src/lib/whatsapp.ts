/** Arma el link para abrir un chat de WhatsApp, opcionalmente con un mensaje ya escrito. */
export function crearEnlaceWhatsApp(numero: string, mensaje?: string): string {
  const base = `https://wa.me/${numero.replace(/\D/g, '')}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
