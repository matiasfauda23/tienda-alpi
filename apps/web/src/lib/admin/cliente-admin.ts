const RUTAS_SIN_REFRESCO = ['/auth/login', '/auth/refrescar', '/auth/salir'];

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type OpcionesPedido = { metodo?: Metodo; cuerpo?: unknown };

/** Error de una llamada del panel, con el código HTTP y el mensaje de la API. */
export class ErrorDeApiAdmin extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeApiAdmin';
    this.estado = estado;
  }
}

/** La sesión no existe o venció del todo: hay que volver a ingresar. */
export class ErrorDeSesion extends Error {
  constructor() {
    super('La sesión expiró. Ingresá de nuevo.');
    this.name = 'ErrorDeSesion';
  }
}

/** Devuelve la URL pública de la API (Next la copia en el JavaScript del navegador). */
function obtenerUrlApiPublica(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error('Falta la variable NEXT_PUBLIC_API_URL.');
  return url;
}

/** Saca un mensaje legible del error de NestJS ({ message: string | string[] }). */
export function extraerMensajeDeError(cuerpo: unknown, estado: number): string {
  if (typeof cuerpo === 'object' && cuerpo !== null && 'message' in cuerpo) {
    const { message } = cuerpo as { message: unknown };
    if (Array.isArray(message)) return message.filter((m) => typeof m === 'string').join('. ');
    if (typeof message === 'string') return message;
  }
  return `Error ${estado} al comunicarse con el servidor.`;
}

/** Prepara el cuerpo: los formularios con archivos van tal cual; el resto, como JSON. */
function armarCuerpo(cuerpo: unknown): Pick<RequestInit, 'body' | 'headers'> {
  if (cuerpo === undefined) return {};
  if (cuerpo instanceof FormData) return { body: cuerpo };
  return { body: JSON.stringify(cuerpo), headers: { 'Content-Type': 'application/json' } };
}

/** Hace la llamada HTTP del panel con las cookies de sesión. */
function llamar(ruta: string, { metodo = 'GET', cuerpo }: OpcionesPedido): Promise<Response> {
  return fetch(`${obtenerUrlApiPublica()}${ruta}`, {
    method: metodo,
    credentials: 'include',
    cache: 'no-store',
    ...armarCuerpo(cuerpo),
  });
}

/** Lee el cuerpo de la respuesta como JSON (o null si viene vacío). */
async function leerCuerpo(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

let refrescoEnCurso: Promise<boolean> | null = null;

/** Pide tokens nuevos con la cookie de refresh; si ya hay un pedido en curso, lo comparte. */
function refrescarSesion(): Promise<boolean> {
  refrescoEnCurso ??= llamar('/auth/refrescar', { metodo: 'POST' })
    .then((respuesta) => respuesta.ok)
    .catch(() => false)
    .finally(() => {
      refrescoEnCurso = null;
    });
  return refrescoEnCurso;
}

/** Llama a la API del panel; si el acceso venció, refresca la sesión una vez y reintenta. */
export async function pedirAdmin<T>(ruta: string, opciones: OpcionesPedido = {}): Promise<T> {
  const puedeRefrescar = !RUTAS_SIN_REFRESCO.includes(ruta);
  let respuesta = await llamar(ruta, opciones);

  if (respuesta.status === 401 && puedeRefrescar) {
    if (!(await refrescarSesion())) throw new ErrorDeSesion();
    respuesta = await llamar(ruta, opciones);
    if (respuesta.status === 401) throw new ErrorDeSesion();
  }

  const cuerpo = await leerCuerpo(respuesta);
  if (!respuesta.ok) {
    throw new ErrorDeApiAdmin(respuesta.status, extraerMensajeDeError(cuerpo, respuesta.status));
  }
  return cuerpo as T;
}
