import { AvisoError, ESTILOS_ADMIN } from '../comunes';

type Props = {
  hayCambios: boolean;
  enCurso: boolean;
  guardado: boolean;
  error: string | null;
  alGuardar: () => void;
};

/** Botón de guardar de una sección, con los avisos de guardado y de error. */
export function PieSeccion({ hayCambios, enCurso, guardado, error, alGuardar }: Props) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={alGuardar} disabled={!hayCambios || enCurso} className={ESTILOS_ADMIN.botonPrimario}>
          {enCurso ? 'Guardando…' : 'Guardar'}
        </button>
        {guardado && !hayCambios && (
          <p role="status" className="text-sm text-acento-oscuro">
            Cambios guardados.
          </p>
        )}
      </div>
      <AvisoError mensaje={error} />
    </div>
  );
}
