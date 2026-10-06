import { Body, Controller, Put } from '@nestjs/common';
import { ContenidoSitio } from './contenido.tipos';
import { ContenidoService } from './contenido.service';
import { BannerDto } from './dto/banner.dto';
import { CondicionesDto } from './dto/condiciones.dto';
import { ContactoDto } from './dto/contacto.dto';
import { FaqDto } from './dto/faq.dto';

/** Endpoints del panel para editar el contenido del sitio (requieren sesión iniciada). */
@Controller('admin/contenido')
export class ContenidoAdminController {
  constructor(private readonly contenidoService: ContenidoService) {}

  /** PUT /api/admin/contenido/contacto → WhatsApp, email y redes. */
  @Put('contacto')
  guardarContacto(@Body() dto: ContactoDto): Promise<ContenidoSitio> {
    return this.contenidoService.guardarContacto(dto);
  }

  /** PUT /api/admin/contenido/banner → banner del inicio. */
  @Put('banner')
  guardarBanner(@Body() dto: BannerDto): Promise<ContenidoSitio> {
    return this.contenidoService.guardarBanner(dto);
  }

  /** PUT /api/admin/contenido/faq → lista completa de preguntas frecuentes. */
  @Put('faq')
  guardarFaq(@Body() dto: FaqDto): Promise<ContenidoSitio> {
    return this.contenidoService.guardarFaq(dto);
  }

  /** PUT /api/admin/contenido/condiciones → condiciones de venta en Markdown. */
  @Put('condiciones')
  guardarCondiciones(@Body() dto: CondicionesDto): Promise<ContenidoSitio> {
    return this.contenidoService.guardarCondiciones(dto);
  }
}
