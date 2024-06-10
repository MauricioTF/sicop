import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IncidenciasReportadasPage } from './incidencias-reportadas.page';

const routes: Routes = [
  {
    path: '',
    component: IncidenciasReportadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidenciasReportadasPageRoutingModule {}
