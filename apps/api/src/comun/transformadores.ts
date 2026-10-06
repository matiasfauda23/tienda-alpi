import { Transform } from 'class-transformer';

/** Decorador para DTOs: quita los espacios al principio y al final si el valor es texto. */
export const RecortarTexto = () =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value));

/** Decorador para DTOs: quita espacios y pasa el texto a mayúsculas (útil para códigos como el SKU). */
export const AMayusculas = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );
