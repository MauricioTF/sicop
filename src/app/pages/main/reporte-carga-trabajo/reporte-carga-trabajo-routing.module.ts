import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteCargaTrabajoPage } from './reporte-carga-trabajo.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteCargaTrabajoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteCargaTrabajoPageRoutingModule {}
