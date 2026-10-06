import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

/** Datos para iniciar sesión. */
export class LoginDto {
  // Se compara siempre en minúsculas y sin espacios
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Ingresá un email válido.' })
  @MaxLength(160, { message: 'El email es demasiado largo.' })
  email!: string;

  // El máximo evita que alguien mande textos enormes para saturar el hash (que es lento a propósito)
  @IsString({ message: 'La contraseña debe ser un texto.' })
  @Length(1, 200, { message: 'La contraseña debe tener entre 1 y 200 caracteres.' })
  contrasena!: string;
}
