export const ESTILOS_ADMIN = {
  campo:
    'w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm text-texto focus:border-acento focus:outline-none',
  botonPrimario:
    'rounded-full bg-acento px-5 py-2 text-sm font-semibold text-white transition hover:bg-acento-oscuro disabled:opacity-50',
  botonSecundario:
    'rounded-full border border-borde bg-superficie px-5 py-2 text-sm font-semibold text-texto transition hover:border-acento disabled:opacity-50',
  botonPeligro: 'text-sm font-semibold text-oferta hover:underline disabled:opacity-50',
} as const;

/** Indicador de carga de una sección del panel. */
export function CargandoAdmin() {
  return <div className="h-48 animate-pulse rounded-2xl bg-borde/60" aria-busy="true" />;
}

/** Error al cargar una sección, con botón para reintentar. */
export function ErrorDeCarga({ mensaje, alReintentar }: { mensaje: string; alReintentar: () => void }) {
  return (
    <div className="rounded-2xl border border-oferta/40 p-6 text-center">
      <p className="text-oferta">{mensaje}</p>
      <button type="button" onClick={alReintentar} className={`mt-4 ${ESTILOS_ADMIN.botonSecundario}`}>
        Reintentar
      </button>
    </div>
  );
}

/** Mensaje de error de una acción (guardar, borrar), anunciado a lectores de pantalla. */
export function AvisoError({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="text-sm text-oferta">
      {mensaje}
    </p>
  );
}
