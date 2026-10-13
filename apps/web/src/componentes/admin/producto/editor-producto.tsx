'use client';

import Link from 'next/link';
import { use, useState, type FormEvent } from 'react';
import { Etiqueta } from '@/componentes/ui/etiqueta';
import type { Categoria, Producto } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { ordenarCategorias } from '@/lib/admin/categorias-admin';
import { useAccionAdmin, useDatosAdmin } from '@/lib/admin/datos';
import {
  convertirBorradorProducto,
  crearBorradorProducto,
  datosDeProducto,
  diferencias,
  esIdValido,
  hayErrores,
  validarBorradorProducto,
} from '@/lib/admin/formulario-producto';
import { AvisoError, CargandoAdmin, ErrorDeCarga, ESTILOS_ADMIN } from '../comunes';
import { ESTILO_TARJETA } from './campo';
import { CamposProducto } from './campos-producto';
import { SeccionVariantes } from './seccion-variantes';

type PropsDatos = { producto: Producto; categorias: Categoria[]; alGuardar: (producto: Producto) => void };

/** Datos generales del producto: se guardan solo los campos que cambiaron. */
function SeccionDatosProducto({ producto, categorias, alGuardar }: PropsDatos) {
  const [borrador, setBorrador] = useState(() => crearBorradorProducto(producto));
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const errores = validarBorradorProducto(borrador);
  const cambios = diferencias(datosDeProducto(producto), convertirBorradorProducto(borrador));
  const hayCambios = Object.keys(cambios).length > 0;

  /** Valida y guarda los cambios del producto. */
  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMostrarErrores(true);
    if (hayErrores(errores) || !hayCambios) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<Producto>(`/admin/productos/${producto.id}`, { metodo: 'PATCH', cuerpo: cambios }),
    );
    if (resultado.ok) {
      alGuardar(resultado.valor);
      setMostrarErrores(false);
      setGuardado(true);
    }
  }

  return (
    <form onSubmit={guardar} className={ESTILO_TARJETA}>
      <h2 className="mb-4 font-titulos text-xl text-texto">Datos del producto</h2>
      <CamposProducto
        borrador={borrador}
        errores={mostrarErrores ? errores : {}}
        categorias={categorias}
        alCambiar={(nuevo) => {
          setBorrador(nuevo);
          setGuardado(false);
        }}
      />
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={!hayCambios || enCurso} className={ESTILOS_ADMIN.botonPrimario}>
          Guardar cambios
        </button>
        {guardado && (
          <p role="status" className="text-sm text-acento-oscuro">
            Cambios guardados.
          </p>
        )}
      </div>
      <AvisoError mensaje={error} />
    </form>
  );
}

/** Carga el producto y las categorías, y muestra las dos secciones del editor. */
function EditorProductoCargado({ id }: { id: string }) {
  const producto = useDatosAdmin<Producto>(`/admin/productos/${id}`);
  const categorias = useDatosAdmin<Categoria[]>('/admin/categorias');

  if (producto.carga.estado === 'error') {
    return <ErrorDeCarga mensaje={producto.carga.mensaje} alReintentar={producto.recargar} />;
  }
  if (categorias.carga.estado === 'error') {
    return <ErrorDeCarga mensaje={categorias.carga.mensaje} alReintentar={categorias.recargar} />;
  }
  if (producto.carga.estado !== 'listo' || categorias.carga.estado !== 'listo') return <CargandoAdmin />;

  const datos = producto.carga.datos;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-titulos text-3xl text-texto">{datos.nombre}</h1>
        <Etiqueta tono={datos.activo ? 'acento' : 'neutro'}>{datos.activo ? 'Visible' : 'Oculto'}</Etiqueta>
        {datos.activo && (
          <a
            href={`/productos/${datos.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-texto-suave underline hover:text-texto"
          >
            Ver en la tienda
          </a>
        )}
      </div>
      <SeccionDatosProducto
        key={datos.id}
        producto={datos}
        categorias={ordenarCategorias(categorias.carga.datos)}
        alGuardar={producto.reemplazar}
      />
      <SeccionVariantes producto={datos} alCambiar={producto.reemplazar} />
    </div>
  );
}

/** Editor de un producto: valida el id de la URL antes de pedir nada a la API. */
export function EditorProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  if (!esIdValido(id)) {
    return (
      <p className="text-texto-suave">
        No encontramos ese producto.{' '}
        <Link href="/admin/productos" className="underline">
          Volver al listado
        </Link>
      </p>
    );
  }
  return <EditorProductoCargado id={id} />;
}
