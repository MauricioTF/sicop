import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteCargaTrabajoPageRoutingModule } from './reporte-carga-trabajo-routing.module';

import { ReporteCargaTrabajoPage } from './reporte-carga-trabajo.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [ReporteCargaTrabajoPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReporteCargaTrabajoPageRoutingModule,
        SharedModule
    ]
})
export class ReporteCargaTrabajoPageModule {}
