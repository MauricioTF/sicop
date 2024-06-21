import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadersComponent } from './components/headers/headers.component';
import { LoginInputComponent } from './components/login-input/login-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { UpdateAdministratorComponent } from './components/update-administrator/update-administrator.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActualizarIncidenciaComponent } from './components/actualizar-incidencia/actualizar-incidencia.component';
import { DiagnosticoIncidenciaComponent } from './components/diagnostico-incidencia/diagnostico-incidencia.component';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario.component';
import { AsignarIncidenciaComponent } from './components/asignar-incidencia/asignar-incidencia.component';
import { IncidenciasReportadasCompletaComponent } from './info-completa/incidencias-reportadas-completa/incidencias-reportadas-completa.component';

@NgModule({
  declarations: [
    HeadersComponent,
    LoginInputComponent,
    LogoComponent,
    UpdateAdministratorComponent,
    ActualizarIncidenciaComponent,
    DiagnosticoIncidenciaComponent,
    RegistrarUsuarioComponent,
    AsignarIncidenciaComponent,
    IncidenciasReportadasCompletaComponent,
  ],
  exports: [
    HeadersComponent,
    LoginInputComponent,
    LogoComponent,
    UpdateAdministratorComponent,
    ActualizarIncidenciaComponent,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    DiagnosticoIncidenciaComponent,
    RegistrarUsuarioComponent,
    AsignarIncidenciaComponent,
    IncidenciasReportadasCompletaComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
