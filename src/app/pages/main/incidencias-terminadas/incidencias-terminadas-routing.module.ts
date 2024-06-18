import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IncidenciasTerminadasPage } from './incidencias-terminadas.page';

const routes: Routes = [
  {
    path: '',
    component: IncidenciasTerminadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidenciasTerminadasPageRoutingModule {}
