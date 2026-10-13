import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EtiquetaCache } from './revalidar.decorator';

const LARGO_MINIMO_SECRETO = 32;
const ESPERA_MAXIMA_MS = 5000;

/** Le avisa a la web qué datos cambiaron para que vuelva a pedirlos. */
@Injectable()
export class RevalidacionService {
  private readonly logger = new Logger(RevalidacionService.name);
  private readonly url: string | null;
  private readonly secreto: string | null;

  constructor(configuracion: ConfigService) {
    const secreto = configuracion.get<string>('REVALIDACION_SECRETO') ?? '';
    const urlFrontend = (configuracion.get<string>('URL_FRONTEND') ?? '').replace(/\/$/, '');
    const habilitado = secreto.length >= LARGO_MINIMO_SECRETO && urlFrontend !== '';

    this.secreto = habilitado ? secreto : null;
    this.url = habilitado ? `${urlFrontend}/api/revalidar` : null;
    if (!habilitado) {
      this.logger.warn('Revalidación desactivada: falta REVALIDACION_SECRETO (32+ caracteres) o URL_FRONTEND.');
    }
  }

  /** Avisa a la web; si no responde, solo lo registra (nunca hace fallar el guardado). */
  async avisar(etiquetas: readonly EtiquetaCache[]): Promise<void> {
    if (!this.url || !this.secreto || etiquetas.length === 0) return;
    try {
      const respuesta = await fetch(this.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.secreto}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ etiquetas }),
        signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
      });
      if (!respuesta.ok) {
        this.logger.warn(`La web respondió ${respuesta.status} al revalidar: ${etiquetas.join(', ')}.`);
      }
    } catch (error) {
      const detalle = error instanceof Error ? error.message : String(error);
      this.logger.warn(`No se pudo avisar a la web (${etiquetas.join(', ')}): ${detalle}`);
    }
  }
}
