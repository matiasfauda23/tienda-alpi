import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, Matches, MaxLength } from 'class-validator';

/** Quita espacios y la "@" del principio de un usuario de red social. */
const limpiarUsuario = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/^@/, '') : value;

/** Datos de contacto que carga Marce desde el panel. */
export class ContactoDto {
  // Acepta "+54 9 11 7825-4471" y guarda solo los dígitos: "5491178254471"
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^\d{10,15}$/, {
    message: 'El WhatsApp debe tener entre 10 y 15 dígitos, con código de país (ej. 5491178254471).',
  })
  whatsapp!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Ingresá un email válido.' })
  @MaxLength(160, { message: 'El email es demasiado largo.' })
  email?: string;

  @IsOptional()
  @Transform(limpiarUsuario)
  @Matches(/^[A-Za-z0-9._]{1,30}$/, { message: 'El usuario de Instagram no es válido.' })
  instagram?: string;

  @IsOptional()
  @Transform(limpiarUsuario)
  @Matches(/^[A-Za-z0-9._]{2,24}$/, { message: 'El usuario de TikTok no es válido.' })
  tiktok?: string;
}
