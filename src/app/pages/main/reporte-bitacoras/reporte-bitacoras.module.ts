import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteBitacorasPageRoutingModule } from './reporte-bitacoras-routing.module';

import { ReporteBitacorasPage } from './reporte-bitacoras.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [ReporteBitacorasPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReporteBitacorasPageRoutingModule,
        SharedModule
    ]
})
export class ReporteBitacorasPageModule {}
