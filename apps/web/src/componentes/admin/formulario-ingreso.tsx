'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useSesion } from '@/lib/admin/sesion';
import { describirErrorDeIngreso, elegirDestinoSeguro } from '@/lib/admin/utilidades';

const ESTILO_CAMPO =
  'w-full rounded-lg border border-borde bg-fondo px-3 py-2.5 text-texto focus:border-acento focus:outline-none';

/** Formulario de login; si la sesión ya está activa, lleva directo al destino. */
export function FormularioIngreso() {
  const { sesion, ingresar } = useSesion();
  const router = useRouter();
  const destino = elegirDestinoSeguro(useSearchParams().get('volver'));
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (sesion.estado === 'activa') router.replace(destino);
  }, [sesion.estado, destino, router]);

  /** Envía las credenciales; si son correctas, la sesión pasa a activa y el efecto redirige. */
  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setEnviando(true);
    setError(null);
    try {
      await ingresar(String(datos.get('email') ?? ''), String(datos.get('contrasena') ?? ''));
    } catch (errorDeIngreso) {
      setError(describirErrorDeIngreso(errorDeIngreso));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form method="post" onSubmit={alEnviar} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-texto">
        Email
        <input name="email" type="email" autoComplete="username" required className={ESTILO_CAMPO} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-texto">
        Contraseña
        <input
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          className={ESTILO_CAMPO}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-oferta">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="mt-2 rounded-full bg-acento px-6 py-3 font-semibold text-white transition hover:bg-acento-oscuro disabled:opacity-50"
      >
        {enviando ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
