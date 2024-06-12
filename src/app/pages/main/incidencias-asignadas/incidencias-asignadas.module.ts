import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncidenciasAsignadasPageRoutingModule } from './incidencias-asignadas-routing.module';

import { IncidenciasAsignadasPage } from './incidencias-asignadas.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [IncidenciasAsignadasPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        IncidenciasAsignadasPageRoutingModule,
        SharedModule
    ]
})
export class IncidenciasAsignadasPageModule {}
