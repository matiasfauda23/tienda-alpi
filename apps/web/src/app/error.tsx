'use client';

/** Página que se muestra si algo falla al armar una página (por ejemplo, si la API no responde). */
export default function ErrorDePagina({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-titulos text-4xl font-medium">Algo salió mal</h1>
      <p className="text-texto-suave">No pudimos cargar esta página. Probá de nuevo en unos segundos.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-12 items-center rounded-full bg-acento px-7 font-semibold text-white hover:bg-acento-oscuro"
      >
        Reintentar
      </button>
    </section>
  );
}
