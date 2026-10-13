'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { Categoria, Producto } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { ordenarCategorias } from '@/lib/admin/categorias-admin';
import { useAccionAdmin, useDatosAdmin } from '@/lib/admin/datos';
import {
  convertirBorradorProducto,
  convertirBorradorVariante,
  crearBorradorProducto,
  crearBorradorVariante,
  encontrarSkuRepetido,
  hayErrores,
  validarBorradorProducto,
  validarBorradorVariante,
  type BorradorVariante,
} from '@/lib/admin/formulario-producto';
import { AvisoError, CargandoAdmin, ErrorDeCarga, ESTILOS_ADMIN } from '../comunes';
import { ESTILO_TARJETA } from './campo';
import { CamposProducto } from './campos-producto';
import { CamposVariante } from './campos-variante';

/** Alta de un producto con una o más variantes; al crearlo, abre su página de edición. */
export function FormularioNuevoProducto() {
  const router = useRouter();
  const { carga, recargar } = useDatosAdmin<Categoria[]>('/admin/categorias');
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const [producto, setProducto] = useState(() => crearBorradorProducto());
  const [variantes, setVariantes] = useState<BorradorVariante[]>(() => [crearBorradorVariante()]);
  const [mostrarErrores, setMostrarErrores] = useState(false);

  if (carga.estado === 'cargando') return <CargandoAdmin />;
  if (carga.estado === 'error') return <ErrorDeCarga mensaje={carga.mensaje} alReintentar={recargar} />;

  const categorias = ordenarCategorias(carga.datos);
  if (categorias.length === 0) {
    return (
      <p className="text-texto-suave">
        Primero creá una categoría en{' '}
        <Link href="/admin/productos/categorias" className="underline">
          Categorías
        </Link>
        .
      </p>
    );
  }

  const erroresProducto = validarBorradorProducto(producto);
  const erroresVariantes = variantes.map(validarBorradorVariante);
  const skuRepetido = encontrarSkuRepetido(variantes);

  /** Cambia una variante del formulario por su posición. */
  function cambiarVariante(indice: number, borrador: BorradorVariante) {
    setVariantes(variantes.map((actual, i) => (i === indice ? borrador : actual)));
  }

  /** Valida todo y crea el producto; si sale bien, abre la pantalla de edición. */
  async function crear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMostrarErrores(true);
    if (hayErrores(erroresProducto) || erroresVariantes.some(hayErrores) || skuRepetido) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<Producto>('/admin/productos', {
        metodo: 'POST',
        cuerpo: { ...convertirBorradorProducto(producto), variantes: variantes.map(convertirBorradorVariante) },
      }),
    );
    if (resultado.ok) router.replace(`/admin/productos/${resultado.valor.id}`);
  }

  return (
    <form onSubmit={crear} className="flex flex-col gap-6">
      <section className={ESTILO_TARJETA}>
        <h2 className="mb-4 font-titulos text-xl text-texto">Datos del producto</h2>
        <CamposProducto
          borrador={producto}
          errores={mostrarErrores ? erroresProducto : {}}
          categorias={categorias}
          alCambiar={setProducto}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-titulos text-xl text-texto">Variantes</h2>
        <p className="-mt-2 text-sm text-texto-suave">
          Cada color o modelo es una variante, con su propio precio y stock. Si hay uno solo, llamalo "Único".
        </p>
        {variantes.map((variante, indice) => (
          <div key={indice} className={ESTILO_TARJETA}>
            <CamposVariante
              borrador={variante}
              errores={mostrarErrores ? erroresVariantes[indice] : {}}
              alCambiar={(borrador) => cambiarVariante(indice, borrador)}
            />
            {variantes.length > 1 && (
              <button
                type="button"
                onClick={() => setVariantes(variantes.filter((_, i) => i !== indice))}
                className={`mt-3 ${ESTILOS_ADMIN.botonPeligro}`}
              >
                Quitar esta variante
              </button>
            )}
          </div>
        ))}
        {variantes.length < 50 && (
          <button
            type="button"
            onClick={() => setVariantes([...variantes, crearBorradorVariante(undefined, variantes.length)])}
            className={`self-start ${ESTILOS_ADMIN.botonSecundario}`}
          >
            + Agregar otra variante
          </button>
        )}
      </section>

      {mostrarErrores && skuRepetido && <AvisoError mensaje={`El SKU ${skuRepetido} está repetido.`} />}
      {mostrarErrores && (hayErrores(erroresProducto) || erroresVariantes.some(hayErrores)) && (
        <AvisoError mensaje="Revisá los campos marcados en rojo." />
      )}
      <AvisoError mensaje={error} />

      <div className="flex gap-3">
        <button type="submit" disabled={enCurso} className={ESTILOS_ADMIN.botonPrimario}>
          {enCurso ? 'Creando…' : 'Crear producto'}
        </button>
        <Link href="/admin/productos" className={ESTILOS_ADMIN.botonSecundario}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
