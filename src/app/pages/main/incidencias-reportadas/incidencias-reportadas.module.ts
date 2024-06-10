import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncidenciasReportadasPageRoutingModule } from './incidencias-reportadas-routing.module';

import { IncidenciasReportadasPage } from './incidencias-reportadas.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [IncidenciasReportadasPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        IncidenciasReportadasPageRoutingModule,
        SharedModule
    ]
})
export class IncidenciasReportadasPageModule {}
