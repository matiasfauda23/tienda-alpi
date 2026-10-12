import type { ReactNode } from 'react';
import { formatearPrecio } from '@/lib/formato';
import type { ResumenPedido } from '@/lib/pedido/resumen';

type Props = {
  resumen: ResumenPedido;
  puedeEnviar: boolean;
  enviando: boolean;
  error: string | null;
  alEnviar: () => void;
  alVaciar: () => void;
};

/** Par nombre/valor dentro de la lista de totales. */
function Dato({ nombre, children }: { nombre: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-texto-suave">{nombre}</dt>
      <dd className="text-right text-texto">{children}</dd>
    </div>
  );
}

/** Muestra cuánto falta para la siguiente escala, con una barra de progreso. */
function ProgresoEscala({ resumen }: { resumen: ResumenPedido }) {
  const { siguienteEscala, totalUnidades, unidadesParaSiguienteEscala } = resumen;
  if (!siguienteEscala) return null;
  const porcentaje = Math.min(100, Math.round((totalUnidades / siguienteEscala.cantidadMinima) * 100));
  return (
    <div className="rounded-xl bg-acento-suave p-3 text-sm text-acento-tinta">
      <p>
        Te faltan <strong>{unidadesParaSiguienteEscala}</strong> unidades para precio{' '}
        <strong>{siguienteEscala.nombre}</strong>.
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70" aria-hidden="true">
        <div className="h-full rounded-full bg-acento" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

/** Panel con totales, escala alcanzada, progreso a la siguiente y el envío por WhatsApp. */
export function ResumenDelPedido({ resumen, puedeEnviar, enviando, error, alEnviar, alVaciar }: Props) {
  const { escalaAplicada } = resumen;
  return (
    <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-borde bg-superficie p-5 lg:sticky lg:top-24">
      <h2 className="font-titulos text-xl text-texto">Resumen</h2>
      <dl className="flex flex-col gap-2 text-sm">
        <Dato nombre="Unidades">{resumen.totalUnidades}</Dato>
        <Dato nombre="Escala">
          {escalaAplicada ? escalaAplicada.nombre : '-'}
          {escalaAplicada && escalaAplicada.porcentajeDescuento > 0 && ` (-${escalaAplicada.porcentajeDescuento}%)`}
        </Dato>
        {resumen.ahorro > 0 && (
          <>
            <Dato nombre="Precio de lista">
              <s>{formatearPrecio(resumen.totalPrecioLista)}</s>
            </Dato>
            <Dato nombre="Ahorrás">
              <span className="font-semibold text-acento-oscuro">{formatearPrecio(resumen.ahorro)}</span>
            </Dato>
          </>
        )}
      </dl>
      <div className="flex items-baseline justify-between border-t border-borde pt-4">
        <span className="font-semibold text-texto">Total</span>
        <span className="font-titulos text-2xl text-texto">{formatearPrecio(resumen.total)}</span>
      </div>

      <ProgresoEscala resumen={resumen} />

      <button
        type="button"
        onClick={alEnviar}
        disabled={!puedeEnviar || enviando}
        className="rounded-full bg-acento px-6 py-3 font-semibold text-white transition hover:bg-acento-oscuro disabled:opacity-50"
      >
        {enviando ? 'Preparando…' : 'Enviar pedido por WhatsApp'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-oferta">
          {error}
        </p>
      )}
      <p className="text-xs text-texto-suave">
        No se cobra nada en la web. Te confirmamos stock, envío y pago (efectivo o transferencia) por
        WhatsApp.
      </p>
      <button type="button" onClick={alVaciar} className="text-sm text-texto-suave underline hover:text-oferta">
        Vaciar pedido
      </button>
    </aside>
  );
}
