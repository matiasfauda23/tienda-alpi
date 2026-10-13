'use client';

import { soloDigitos, type BorradorVariante, type Errores } from '@/lib/admin/formulario-producto';
import { ESTILOS_ADMIN } from '../comunes';
import { Campo } from './campo';

const COLOR_INICIAL = '#5f6e45';

type Props = {
  borrador: BorradorVariante;
  errores: Errores<BorradorVariante>;
  alCambiar: (borrador: BorradorVariante) => void;
};

/** Campos de una variante: SKU, nombre, color, precios, stock y orden. */
export function CamposVariante({ borrador, errores, alCambiar }: Props) {
  /** Cambia un campo del borrador manteniendo el resto. */
  function cambiar(campo: keyof BorradorVariante, valor: string) {
    alCambiar({ ...borrador, [campo]: valor });
  }

  /** Campo numérico que solo acepta dígitos. */
  function campoNumerico(campo: keyof BorradorVariante, etiqueta: string, ejemplo = '') {
    return (
      <Campo etiqueta={etiqueta} error={errores[campo]}>
        <input
          inputMode="numeric"
          value={borrador[campo]}
          placeholder={ejemplo}
          onChange={(evento) => cambiar(campo, soloDigitos(evento.target.value))}
          aria-invalid={Boolean(errores[campo])}
          className={ESTILOS_ADMIN.campo}
        />
      </Campo>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Campo etiqueta="SKU (código)" error={errores.sku}>
        <input
          value={borrador.sku}
          maxLength={60}
          placeholder="MATE-NEGRO"
          onChange={(evento) => cambiar('sku', evento.target.value.toUpperCase().replace(/\s+/g, '-'))}
          aria-invalid={Boolean(errores.sku)}
          className={ESTILOS_ADMIN.campo}
        />
      </Campo>
      <Campo etiqueta="Nombre (color o modelo)" error={errores.nombre}>
        <input
          value={borrador.nombre}
          maxLength={80}
          placeholder="Negro"
          onChange={(evento) => cambiar('nombre', evento.target.value)}
          aria-invalid={Boolean(errores.nombre)}
          className={ESTILOS_ADMIN.campo}
        />
      </Campo>
      <div className="flex flex-col gap-1 text-xs font-semibold text-texto-suave">
        Color en la tienda
        <div className="flex h-[38px] items-center gap-2">
          <input
            type="checkbox"
            aria-label="Mostrar un color"
            checked={borrador.colorHex !== ''}
            onChange={(evento) => cambiar('colorHex', evento.target.checked ? COLOR_INICIAL : '')}
            className="size-4 accent-acento"
          />
          <input
            type="color"
            aria-label="Elegir color"
            disabled={borrador.colorHex === ''}
            value={borrador.colorHex || COLOR_INICIAL}
            onChange={(evento) => cambiar('colorHex', evento.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-borde bg-superficie disabled:cursor-not-allowed disabled:opacity-40"
          />
          <span className="font-normal">{borrador.colorHex || 'Sin color'}</span>
        </div>
        {errores.colorHex && <span className="font-normal text-oferta">{errores.colorHex}</span>}
      </div>
      {campoNumerico('orden', 'Orden', '0')}
      {campoNumerico('precio', 'Precio ($)', '15000')}
      {campoNumerico('precioOferta', 'Precio de oferta ($, opcional)')}
      {campoNumerico('stock', 'Stock', '10')}
    </div>
  );
}
