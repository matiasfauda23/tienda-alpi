import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { ContenidoRepository } from './contenido.repository';
import {
  Banner,
  ClaveContenido,
  Condiciones,
  Contacto,
  CONTENIDO_POR_DEFECTO,
  ContenidoSitio,
  Faq,
} from './contenido.tipos';
import { BannerDto } from './dto/banner.dto';
import { CondicionesDto } from './dto/condiciones.dto';
import { ContactoDto } from './dto/contacto.dto';
import { FaqDto } from './dto/faq.dto';

/** Indica si un valor es un objeto común (no null, no lista). */
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * Combina lo guardado con los valores por defecto.
 * Si mañana se agrega un campo nuevo, las secciones viejas lo reciben con su valor por defecto.
 */
function combinar<T extends object>(porDefecto: T, guardado: unknown): T {
  return esObjeto(guardado) ? ({ ...porDefecto, ...guardado } as T) : porDefecto;
}

/** Lee y guarda el contenido editable del sitio. */
@Injectable()
export class ContenidoService {
  constructor(private readonly repositorio: ContenidoRepository) {}

  /** Devuelve todo el contenido, completando con valores por defecto lo que falte. */
  async obtenerTodo(): Promise<ContenidoSitio> {
    const filas = await this.repositorio.listar();
    const guardado = new Map(filas.map((fila) => [fila.clave, fila.valor]));

    return {
      contacto: combinar(CONTENIDO_POR_DEFECTO.contacto, guardado.get('contacto')),
      banner: combinar(CONTENIDO_POR_DEFECTO.banner, guardado.get('banner')),
      faq: combinar(CONTENIDO_POR_DEFECTO.faq, guardado.get('faq')),
      condiciones: combinar(CONTENIDO_POR_DEFECTO.condiciones, guardado.get('condiciones')),
    };
  }

  /** Guarda los datos de contacto. */
  guardarContacto(dto: ContactoDto): Promise<ContenidoSitio> {
    const contacto: Contacto = {
      whatsapp: dto.whatsapp,
      email: dto.email ?? '',
      instagram: dto.instagram ?? '',
      tiktok: dto.tiktok ?? '',
    };
    return this.guardar('contacto', contacto);
  }

  /** Guarda el banner del inicio. */
  guardarBanner(dto: BannerDto): Promise<ContenidoSitio> {
    const banner: Banner = { visible: dto.visible, titulo: dto.titulo, subtitulo: dto.subtitulo ?? '' };
    return this.guardar('banner', banner);
  }

  /** Guarda la lista completa de preguntas frecuentes. */
  guardarFaq(dto: FaqDto): Promise<ContenidoSitio> {
    const faq: Faq = {
      preguntas: dto.preguntas.map(({ pregunta, respuesta }) => ({ pregunta, respuesta })),
    };
    return this.guardar('faq', faq);
  }

  /** Guarda las condiciones de venta. */
  guardarCondiciones(dto: CondicionesDto): Promise<ContenidoSitio> {
    const condiciones: Condiciones = { texto: dto.texto };
    return this.guardar('condiciones', condiciones);
  }

  /** Guarda una sección y devuelve el contenido completo actualizado. */
  private async guardar(clave: ClaveContenido, valor: Prisma.InputJsonObject): Promise<ContenidoSitio> {
    await this.repositorio.guardar(clave, valor);
    return this.obtenerTodo();
  }
}
