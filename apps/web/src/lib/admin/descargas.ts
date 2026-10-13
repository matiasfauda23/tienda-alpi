'use client';

/** Hace que el navegador guarde un archivo (Blob) con el nombre indicado. */
export function guardarArchivo(archivo: Blob, nombre: string): void {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  // Se libera la memoria un momento después, cuando la descarga ya empezó
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
