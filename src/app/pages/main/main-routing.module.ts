import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./profile/profile.module').then((m) => m.ProfilePageModule),
      },
      {
        path: 'incidencias-reportadas',
        loadChildren: () => import('./incidencias-reportadas/incidencias-reportadas.module').then( m => m.IncidenciasReportadasPageModule)
      },
      {
        path: 'incidencias-asignadas',
        loadChildren: () => import('./incidencias-asignadas/incidencias-asignadas.module').then( m => m.IncidenciasAsignadasPageModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module').then( m => m.UsuariosPageModule)
      },
      {
        path: 'incidencias-terminadas',
        loadChildren: () => import('./incidencias-terminadas/incidencias-terminadas.module').then( m => m.IncidenciasTerminadasPageModule)
      },
      {
        path: 'reporte-trabajo-categoria',
        loadChildren: () => import('./reporte-trabajo-categoria/reporte-trabajo-categoria.module').then( m => m.ReporteTrabajoCategoriaPageModule)
      },
      {
        path: 'reporte-carga-trabajo',
        loadChildren: () => import('./reporte-carga-trabajo/reporte-carga-trabajo.module').then( m => m.ReporteCargaTrabajoPageModule)
      },
      {
        path: 'reporte-bitacoras',
        loadChildren: () => import('./reporte-bitacoras/reporte-bitacoras.module').then( m => m.ReporteBitacorasPageModule)
      },
    ],
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
