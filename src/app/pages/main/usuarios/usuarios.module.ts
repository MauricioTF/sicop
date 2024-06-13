import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosPageRoutingModule } from './usuarios-routing.module';

import { UsuariosPage } from './usuarios.page';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [UsuariosPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        UsuariosPageRoutingModule,
        SharedModule
    ]
})
export class UsuariosPageModule {}
