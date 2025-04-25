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
    path: 'detalles',
    loadComponent: () => import('./detalles-viaje/detalles-viaje.component').then((m) => m.DetallesViajeComponent),
  },
  {
    path: '',
    redirectTo: 'viajes',
    pathMatch: 'full',
  },

  {
    path: 'viajes',
    loadComponent: () => import('./viajes/viajes.component').then((m) => m.ViajesComponent),
  },
];
