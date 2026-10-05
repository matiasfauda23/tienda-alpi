/** Error que se lanza cuando las escalas o los ítems del pedido no son válidos. */
export class ErrorDeValidacionDePrecios extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeValidacionDePrecios';
  }
}
