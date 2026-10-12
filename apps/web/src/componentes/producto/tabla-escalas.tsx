import { formatearPrecio } from '@/lib/formato';
import { describirRango, type PrecioEnEscala } from '@/lib/precios-producto';

/** Tabla con el precio por unidad en cada escala y el porcentaje de ahorro. */
export function TablaEscalas({ precios }: { precios: PrecioEnEscala[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-borde bg-superficie">
      <table className="w-full text-sm">
        <caption className="bg-acento-suave px-4 py-3 text-left font-semibold text-acento-tinta">
          Precio por unidad según el total del pedido
        </caption>
        <thead className="text-left text-texto-suave">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">Escala</th>
            <th scope="col" className="px-4 py-2 font-medium">Unidades</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">Por unidad</th>
          </tr>
        </thead>
        <tbody>
          {precios.map(({ escala, cantidadMaxima, precioUnitario, porcentajeAhorro }) => (
            <tr key={escala.id} className="border-t border-borde">
              <th scope="row" className="px-4 py-3 text-left font-semibold text-texto">{escala.nombre}</th>
              <td className="px-4 py-3 text-texto-suave">{describirRango(escala.cantidadMinima, cantidadMaxima)}</td>
              <td className="px-4 py-3 text-right">
                <span className="font-semibold text-texto">{formatearPrecio(precioUnitario)}</span>
                {porcentajeAhorro > 0 && (
                  <span className="ml-2 text-xs font-semibold text-acento-oscuro">-{porcentajeAhorro}%</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-borde px-4 py-3 text-xs text-texto-suave">
        Las unidades se suman entre todos los productos del pedido.
      </p>
    </div>
  );
}
