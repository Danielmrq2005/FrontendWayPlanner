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
    path: 'gastos',
    loadComponent: () => import('./gastos/gastos.component').then((m) => m.GastosComponent),
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
    path: 'viajes',
    loadComponent: () => import('./viajes/viajes.component').then((m) => m.ViajesComponent),
  },
];
