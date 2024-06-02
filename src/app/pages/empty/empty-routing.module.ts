import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmptyPage } from './empty.page';

const routes: Routes = [
  {
    path: '',
    component: EmptyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmptyPageRoutingModule {}
