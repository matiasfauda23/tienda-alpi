import type { EscalaPrecio } from '@tienda-alpi/precios';
import { describirRangos } from '@/lib/escalas';

/** Explica cómo funcionan los precios por cantidad, con una tarjeta por escala. */
export function SeccionPrecios({ escalas }: { escalas: EscalaPrecio[] }) {
  if (escalas.length === 0) {
    return null;
  }

  const rangos = describirRangos(escalas);
  const mejorEscala = rangos.at(-1)?.escala.id;

  return (
    <section id="precios" className="scroll-mt-6 border-y border-borde bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6">
        <div className="flex max-w-2xl flex-col gap-2">
          <h2 className="font-titulos text-3xl font-medium">Precios por cantidad</h2>
          <p className="text-texto-suave">
            Se cuenta el total de unidades de tu pedido, sumando productos y colores distintos. Por ejemplo, 60
            mates de un modelo y 40 de otro ya son 100 unidades.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {rangos.map(({ escala, rango }) => {
            const esLaMejor = escala.id === mejorEscala && rangos.length > 1;

            return (
              <li
                key={escala.id}
                className={`flex flex-col gap-1 rounded-2xl p-7 ${esLaMejor ? 'border-2 border-acento bg-acento-suave text-acento-tinta' : 'border border-borde bg-fondo'}`}
              >
                <span className="text-sm font-semibold">{rango}</span>
                <span className="font-titulos text-3xl font-medium">
                  {escala.porcentajeDescuento > 0 ? `${escala.porcentajeDescuento} % menos` : 'Precio de lista'}
                </span>
                <span className="text-sm">{escala.nombre}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
