import type { Request } from 'express';

/** El administrador que inició sesión, tal como lo conoce la API. */
export interface AdministradorAutenticado {
  id: string;
  email: string;
}

/** Datos que viajan dentro de un token JWT ("sub" es el id del administrador). */
export interface PayloadToken {
  sub: string;
  email: string;
}

/** Los dos tokens de una sesión. */
export interface ParDeTokens {
  acceso: string;
  refresh: string;
}

/** Resultado de iniciar o renovar una sesión. */
export interface ResultadoSesion {
  administrador: AdministradorAutenticado;
  tokens: ParDeTokens;
}

/** Una petición HTTP a la que el guard ya le agregó el administrador autenticado. */
export interface PeticionAutenticada extends Request {
  administrador?: AdministradorAutenticado;
}
