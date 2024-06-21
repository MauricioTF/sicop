import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteTrabajoCategoriaPageRoutingModule } from './reporte-trabajo-categoria-routing.module';

import { ReporteTrabajoCategoriaPage } from './reporte-trabajo-categoria.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [ReporteTrabajoCategoriaPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReporteTrabajoCategoriaPageRoutingModule,
        SharedModule
    ]
})
export class ReporteTrabajoCategoriaPageModule {}
