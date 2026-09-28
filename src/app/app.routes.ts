import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginPage) },
  {
    path: '', canActivate: [authGuard],
    loadComponent: () => import('./shared/shell/shell').then(m => m.ShellComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage) },
      { path: 'equipo', loadComponent: () => import('./pages/equipo/equipo').then(m => m.EquipoPage) },
      { path: 'jugadores', loadComponent: () => import('./pages/jugadores/jugadores').then(m => m.JugadoresPage) },
      { path: 'jugador/:key', loadComponent: () => import('./pages/jugador/jugador').then(m => m.JugadorPage) },
      { path: 'temporada/:cid', loadComponent: () => import('./pages/temporada/temporada').then(m => m.TemporadaPage) },
      { path: 'encuentro/:id', loadComponent: () => import('./pages/encuentro/encuentro').then(m => m.EncuentroPage) },
      { path: 'rivales/:cid', loadComponent: () => import('./pages/rivales/rivales').then(m => m.RivalesPage) },
      { path: 'alineacion/:cid/:jornada', loadComponent: () => import('./pages/alineacion/alineacion').then(m => m.AlineacionPage) },
      { path: 'cuenta', loadComponent: () => import('./pages/cuenta/cuenta').then(m => m.CuentaPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
