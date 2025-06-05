import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'crear-viaje',
    loadComponent: () => import('./crear-viaje/crear-viaje.component').then((m) => m.CrearViajeComponent),
  },
  {
    path: 'crear-viaje/:id',
    loadComponent: () => import('./crear-viaje/crear-viaje.component').then((m) => m.CrearViajeComponent),
  },

  {
    path: 'viajes/:id',
    loadComponent: () => import('./detalles-viaje/detalles-viaje.component').then((m) => m.DetallesViajeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'crear-cuenta',
    loadComponent: () => import('./crear-cuenta/crear-cuenta.component').then((m) => m.CrearCuentaComponent),
  },
  {
    path: 'verificar',
    loadComponent: () => import('./verificar/verificar.component').then((m) => m.VerificarComponent),
  },
  {
    path: 'crear-gasto/:id',
    loadComponent: () => import('./crear-gasto/crear-gasto.component').then((m) => m.CrearGastoComponent),
  },
  {
    path: 'actualizar-gasto/:id',
    loadComponent: () => import('./actu-gastos/actu-gastos.component').then((m) => m.ActuGastosComponent),
  },
  {
    path: 'gastos/:id',
    loadComponent: () => import('./gastos/gastos.component').then((m) => m.GastosComponent),
  },
  {
    path: 'GraficaViaje',
    loadComponent: () => import('./grafica-viaje/grafica-viaje.component').then((m) => m.GraficaViajeComponent),
  },
  {
    path: 'actu-usuario',
    loadComponent: () => import('./actu-usuario/actu-usuario.component').then((m) => m.ActuUsuarioComponent),
  },
  {
    path: 'crear-ingreso/:id',
    loadComponent: () => import('./crear-ingreso/crear-ingreso.component').then((m) => m.CrearIngresoComponent),
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./notificaciones/notificaciones.component').then((m) => m.NotificacionesComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'itinerarios/:id',
    loadComponent: () => import('./itinerarios/itinerarios.component').then((m) => m.ItinerariosComponent),
  },
  {
    path: 'rutas/:id',
    loadComponent: () => import('./rutas/rutas.component').then((m) => m.RutasComponent),
  },

  {
    path: 'viajes',
    loadComponent: () => import('./viajes/viajes.component').then((m) => m.ViajesComponent),
  },
  {
    path: 'crear-itinerario',
    loadComponent: () => import('./crear-itinerario/crear-itinerario.component').then((m) => m.CrearItinerarioComponent),
  },
  {
    path: 'ajustes',
    loadComponent: () => import('./ajustes/ajustes.component').then((m) => m.AjustesComponent),
  },
  {
    path:'actu-itinerario',
    loadComponent: () => import('./actu-itinerario/actu-itinerario.component').then((m) => m.ActuItinerarioComponent),
  },
  {
    path: 'crear-dia',
    loadComponent: () => import('./crear-dia/crear-dia.component').then((m) => m.CrearDiaComponent),
  }
];
