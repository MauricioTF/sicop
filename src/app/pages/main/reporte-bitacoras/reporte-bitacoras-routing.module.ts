import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteBitacorasPage } from './reporte-bitacoras.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteBitacorasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteBitacorasPageRoutingModule {}
