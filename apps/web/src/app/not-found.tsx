import Link from 'next/link';

/** Página que se muestra cuando una dirección no existe. */
export default function NoEncontrado() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-titulos text-4xl font-medium">No encontramos esta página</h1>
      <p className="text-texto-suave">Puede que el link esté mal escrito o que el producto ya no esté disponible.</p>
      <Link href="/" className="mt-2 inline-flex h-12 items-center rounded-full bg-acento px-7 font-semibold text-white hover:bg-acento-oscuro">
        Volver al inicio
      </Link>
    </section>
  );
}
