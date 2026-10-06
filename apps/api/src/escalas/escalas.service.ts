import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { validarEscalas } from '@tienda-alpi/precios';
import { ReemplazarEscalasDto } from './dto/reemplazar-escalas.dto';
import { EscalaDto } from './dto/escala.dto';
import { EscalaResumen } from './escala.tipos';
import { EscalasRepository } from './escalas.repository';

/** Reglas de negocio de las escalas de precio. */
@Injectable()
export class EscalasService {
  constructor(private readonly repositorio: EscalasRepository) {}

  /** Devuelve las escalas ordenadas de menor a mayor. */
  listar(): Promise<EscalaResumen[]> {
    return this.repositorio.listar();
  }

  /** Valida la lista completa con las reglas del paquete de precios y la guarda. */
  async reemplazar(dto: ReemplazarEscalasDto): Promise<EscalaResumen[]> {
    // El paquete exige un id en cada escala: a las nuevas les damos uno provisorio solo para validar
    validarEscalas(dto.escalas.map((escala, indice) => ({ ...escala, id: escala.id ?? `nueva-${indice}` })));

    await this.verificarIdsExistentes(dto.escalas);
    return this.repositorio.reemplazarTodas(dto.escalas);
  }

  /** Devuelve las escalas para calcular un pedido; si no hay ninguna configurada, responde 503. */
  async obtenerParaCalculo(): Promise<EscalaResumen[]> {
    const escalas = await this.repositorio.listar();

    if (escalas.length === 0) {
      throw new ServiceUnavailableException('Todavía no hay escalas de precio configuradas.');
    }
    return escalas;
  }

  /** Verifica que las escalas enviadas con id existan en la base. */
  private async verificarIdsExistentes(escalas: EscalaDto[]): Promise<void> {
    const idsEnviados = escalas.flatMap((escala) => (escala.id ? [escala.id] : []));
    if (idsEnviados.length === 0) {
      return;
    }

    const idsGuardados = new Set((await this.repositorio.listar()).map((escala) => escala.id));
    const desconocidos = idsEnviados.filter((id) => !idsGuardados.has(id));

    if (desconocidos.length > 0) {
      throw new BadRequestException(`Estas escalas no existen: ${desconocidos.join(', ')}.`);
    }
  }
}
