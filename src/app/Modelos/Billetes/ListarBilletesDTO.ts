export interface ListarBilletesDTO {
  id: number; // Identificador único del billete
  nombre: string; // Nombre del billete
  categoria: string; // Categoría del billete (e.g., "Económica", "Primera Clase")
  pdf: string; // URL del PDF del billete
  viajeId: number; // Identificador del viaje al que pertenece el billete
}
