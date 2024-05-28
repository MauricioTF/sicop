import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarUsuarioPageRoutingModule } from './registrar-usuario-routing.module';

import { RegistrarUsuarioPage } from './registrar-usuario.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [RegistrarUsuarioPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RegistrarUsuarioPageRoutingModule,
        SharedModule
    ]
})
export class RegistrarUsuarioPageModule {}
