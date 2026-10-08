// Forma de los datos que devuelve la API (deben coincidir con los tipos del backend).

export type Contacto = {
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
};

export type Banner = {
  visible: boolean;
  titulo: string;
  subtitulo: string;
};

export type PreguntaFrecuente = {
  pregunta: string;
  respuesta: string;
};

export type ContenidoSitio = {
  contacto: Contacto;
  banner: Banner;
  faq: { preguntas: PreguntaFrecuente[] };
  condiciones: { texto: string };
};

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  activa: boolean;
};

export type Variante = {
  id: string;
  sku: string;
  nombre: string;
  colorHex: string | null;
  precio: number;
  precioOferta: number | null;
  stock: number;
  orden: number;
  preciosFijos: { escalaId: string; precioUnitario: number }[];
};

export type Producto = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  destacado: boolean;
  nuevo: boolean;
  activo: boolean;
  precioDesde: number;
  categoria: { id: string; nombre: string; slug: string; activa: boolean };
  variantes: Variante[];
};

export type PaginaDeResultados<T> = {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
};
