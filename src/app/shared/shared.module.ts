import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadersComponent } from './components/headers/headers.component';
import { LoginInputComponent } from './components/login-input/login-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { UpdateAdministratorComponent } from './components/update-administrator/update-administrator.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActualizarIncidenciaComponent } from './components/actualizar-incidencia/actualizar-incidencia.component';



@NgModule({
  declarations: [
    HeadersComponent,
    LoginInputComponent,
    LogoComponent,
    UpdateAdministratorComponent,
    ActualizarIncidenciaComponent
  ],
  exports: [
    HeadersComponent,
    LoginInputComponent,
    LogoComponent,
    UpdateAdministratorComponent,
    ActualizarIncidenciaComponent,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }