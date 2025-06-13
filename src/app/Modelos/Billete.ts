export interface Billete{
  id?: number; // Identificador único del billete, opcional para nuevas entradas
  nombre: string; // Nombre del billete (e.g., "Billete de avión")
  categoria: string; // Categoría del billete (e.g., "Económica", "Primera Clase")
  pdf: string; // URL del PDF del billete, que puede ser un enlace a un archivo o un recurso en línea
  viajeId: number; // Identificador del viaje al que pertenece el billete, necesario para asociar el billete a un viaje específico
}
