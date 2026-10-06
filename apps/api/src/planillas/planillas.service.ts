import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AdministradorAutenticado } from '../auth/auth.tipos';
import { ProductosService } from '../productos/productos.service';
import { compararConLaBase } from './comparar-cambios';
import { generarPlanilla } from './escribir-planilla';
import { leerPlanilla } from './leer-planilla';
import { ArchivoSubido, ComparacionPlanilla, ResultadoImportacion, VarianteActual } from './planilla.tipos';
import { PlanillasRepository } from './planillas.repository';

/** Exporta e importa los precios y el stock en planillas de Excel. */
@Injectable()
export class PlanillasService {
  constructor(
    private readonly repositorio: PlanillasRepository,
    private readonly productosService: ProductosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /** Genera la planilla con todas las variantes, sus precios y su stock. */
  async exportar(): Promise<Buffer> {
    const variantes = await this.repositorio.listarVariantes();

    return generarPlanilla(
      variantes.map((variante) => ({
        sku: variante.sku,
        categoria: variante.producto.categoria.nombre,
        producto: variante.producto.nombre,
        variante: variante.nombre,
        precio: variante.precio,
        precioOferta: variante.precioOferta,
        stock: variante.stock,
      })),
    );
  }

  /** Lee la planilla y muestra qué cambiaría y qué errores tiene, sin guardar nada. */
  async vistaPrevia(archivo: ArchivoSubido | undefined): Promise<ComparacionPlanilla> {
    const filas = await leerPlanilla(this.obtenerContenido(archivo));
    const variantes = await this.obtenerVariantesActuales();
    return compararConLaBase(filas, variantes);
  }

  /** Aplica la planilla si no tiene errores, recalcula los productos afectados y deja registro en la auditoría. */
  async aplicar(
    archivo: ArchivoSubido | undefined,
    administrador: AdministradorAutenticado,
    ip: string,
  ): Promise<ResultadoImportacion> {
    const { cambios, errores, sinCambios } = await this.vistaPrevia(archivo);

    if (errores.length > 0) {
      throw new BadRequestException({
        message: 'La planilla tiene errores. Corregilos y volvé a subirla: no se guardó ningún cambio.',
        errores,
      });
    }
    if (cambios.length === 0) {
      return { actualizadas: 0, sinCambios };
    }

    await this.repositorio.aplicarCambios(cambios);

    // Si cambió un precio o una oferta, cambia el "precio desde" del producto
    const productosAfectados = [...new Set(cambios.map((cambio) => cambio.productoId))];
    for (const productoId of productosAfectados) {
      await this.productosService.recalcularCamposDerivados(productoId);
    }

    await this.auditoriaService.registrar({
      administradorId: administrador.id,
      accion: 'POST',
      entidad: 'planillas',
      entidadId: null,
      ruta: '/api/admin/planillas/aplicar',
      datos: cambios.map(({ sku, antes, despues }) => ({ sku, antes, despues })),
      ip,
    });

    return { actualizadas: cambios.length, sinCambios };
  }

  /** Devuelve el contenido del archivo subido; si no se subió ninguno, responde 400. */
  private obtenerContenido(archivo: ArchivoSubido | undefined): Buffer {
    if (!archivo) {
      throw new BadRequestException('Adjuntá la planilla .xlsx en el campo "archivo".');
    }
    return archivo.buffer;
  }

  /** Lee las variantes de la base en el formato que usa la comparación. */
  private async obtenerVariantesActuales(): Promise<VarianteActual[]> {
    const variantes = await this.repositorio.listarVariantes();

    return variantes.map((variante) => ({
      id: variante.id,
      productoId: variante.productoId,
      sku: variante.sku,
      producto: variante.producto.nombre,
      variante: variante.nombre,
      precio: variante.precio,
      precioOferta: variante.precioOferta,
      stock: variante.stock,
    }));
  }
}
