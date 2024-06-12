import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IncidenciasAsignadasPage } from './incidencias-asignadas.page';

const routes: Routes = [
  {
    path: '',
    component: IncidenciasAsignadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidenciasAsignadasPageRoutingModule {}
