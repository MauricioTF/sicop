import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncidenciasTerminadasPageRoutingModule } from './incidencias-terminadas-routing.module';

import { IncidenciasTerminadasPage } from './incidencias-terminadas.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [IncidenciasTerminadasPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        IncidenciasTerminadasPageRoutingModule,
        SharedModule
    ]
})
export class IncidenciasTerminadasPageModule {}
