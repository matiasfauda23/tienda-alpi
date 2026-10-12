'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ErrorDeSesion, pedirAdmin } from './cliente-admin';
import type { Administrador } from './tipos';

export type EstadoSesion =
  | { estado: 'verificando' }
  | { estado: 'activa'; administrador: Administrador }
  | { estado: 'inactiva' }
  | { estado: 'error' };

type ValorSesion = {
  sesion: EstadoSesion;
  ingresar: (email: string, contrasena: string) => Promise<void>;
  salir: () => Promise<void>;
  marcarVencida: () => void;
  reintentar: () => void;
};

const ContextoSesion = createContext<ValorSesion | null>(null);

/** Pregunta a la API quién es el usuario; distingue "sin sesión" de "no hay conexión". */
async function consultarSesion(): Promise<EstadoSesion> {
  try {
    const administrador = await pedirAdmin<Administrador>('/auth/yo');
    return { estado: 'activa', administrador };
  } catch (error) {
    return error instanceof ErrorDeSesion ? { estado: 'inactiva' } : { estado: 'error' };
  }
}

/** Guarda el estado de la sesión del panel y lo comparte con todos sus componentes. */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<EstadoSesion>({ estado: 'verificando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    consultarSesion().then((estado) => {
      if (vigente) setSesion(estado);
    });
    return () => {
      vigente = false;
    };
  }, [intento]);

  const valor: ValorSesion = {
    sesion,
    ingresar: async (email, contrasena) => {
      const administrador = await pedirAdmin<Administrador>('/auth/login', {
        metodo: 'POST',
        cuerpo: { email, contrasena },
      });
      setSesion({ estado: 'activa', administrador });
    },
    salir: async () => {
      try {
        await pedirAdmin('/auth/salir', { metodo: 'POST' });
      } finally {
        setSesion({ estado: 'inactiva' });
      }
    },
    marcarVencida: () => setSesion({ estado: 'inactiva' }),
    reintentar: () => {
      setSesion({ estado: 'verificando' });
      setIntento((actual) => actual + 1);
    },
  };

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

/** Hook para leer la sesión desde cualquier componente del panel. */
export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion);
  if (!valor) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>.');
  return valor;
}
