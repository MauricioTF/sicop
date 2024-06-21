import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteTrabajoCategoriaPage } from './reporte-trabajo-categoria.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteTrabajoCategoriaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteTrabajoCategoriaPageRoutingModule {}
