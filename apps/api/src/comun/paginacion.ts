/** Una página de resultados, con los datos que necesita el frontend para armar el paginador. */
export interface PaginaDeResultados<T> {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

/** Calcula cuántos registros hay que saltear para llegar a una página (la primera es la 1). */
export function calcularSalto(pagina: number, porPagina: number): number {
  return (pagina - 1) * porPagina;
}
