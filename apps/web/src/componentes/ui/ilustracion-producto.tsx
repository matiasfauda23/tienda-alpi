/** Forma y colores del dibujo de cada tipo de producto. */
const ILUSTRACIONES = {
  mates: {
    fondo: '#e9ece1',
    tinta: '#5f6e45',
    forma: 'M28 18h44c3 0 5 3 4 6-3 9-3 16 2 25 7 13 6 34-6 45-3 3-6 4-10 4H38c-4 0-7-1-10-4-12-11-13-32-6-45 5-9 5-16 2-25-1-3 1-6 4-6z',
  },
  termos: {
    fondo: '#f1e6df',
    tinta: '#a4532f',
    forma: 'M38 4h24v10H38zM34 16h32c4 0 6 3 6 6v78c0 4-3 6-6 6H34c-3 0-6-2-6-6V22c0-3 2-6 6-6z',
  },
  vasos: {
    fondo: '#ece7ef',
    tinta: '#6e5a7e',
    forma: 'M24 10h52l-7 90c0 4-3 6-7 6H38c-4 0-7-2-7-6z',
  },
  bombillas: {
    fondo: '#efebe3',
    tinta: '#5e5a55',
    forma: 'M47 6h6v80c5 2 8 7 8 12 0 6-5 10-11 10s-11-4-11-10c0-5 3-10 8-12z',
  },
} as const;

type TipoIlustracion = keyof typeof ILUSTRACIONES;

/** Indica si el slug de una categoría tiene un dibujo propio. */
function tieneIlustracion(slug: string): slug is TipoIlustracion {
  return slug in ILUSTRACIONES;
}

/** Dibujo genérico de un producto según su categoría. Ocupa el lugar de la foto hasta que haya imágenes. */
export function IlustracionProducto({ categoria, className = '' }: { categoria: string; className?: string }) {
  const { fondo, tinta, forma } = ILUSTRACIONES[tieneIlustracion(categoria) ? categoria : 'mates'];

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ backgroundColor: fondo }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 110" className="h-1/2 w-auto">
        <path d={forma} fill={tinta} />
      </svg>
    </div>
  );
}
