import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
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
    path: 'crear-gasto',
    loadComponent: () => import('./crear-gasto/crear-gasto.component').then((m) => m.CrearGastoComponent),
  },
  {
    path: 'actualizar-gasto/:id',
    loadComponent: () => import('./actu-gastos/actu-gastos.component').then((m) => m.ActuGastosComponent),
  },
  {
    path: 'gastos',
    loadComponent: () => import('./gastos/gastos.component').then((m) => m.GastosComponent),
  },
  {
    path: 'GraficaViaje',
    loadComponent: () => import('./grafica-viaje/grafica-viaje.component').then((m) => m.GraficaViajeComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
