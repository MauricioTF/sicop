import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ActualizarIncidenciaComponent } from 'src/app/shared/components/actualizar-incidencia/actualizar-incidencia.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { map } from 'rxjs';
import { Diagnostico } from 'src/app/models/diagnostico.model';
import { DiagnosticoIncidenciaComponent } from 'src/app/shared/components/diagnostico-incidencia/diagnostico-incidencia.component';

import { combineLatest } from 'rxjs';
import { Rol } from 'src/app/models/rol.model';
import { AsignarIncidenciaComponent } from 'src/app/shared/components/asignar-incidencia/asignar-incidencia.component';
import { Asignaciones } from 'src/app/models/asignaciones.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  userId: string | null = null;

  loading: boolean = false;
  incidencia : Incidencia[] = [];

  specificRole: any;
  roles: any;
  id_rol_usuario : any;
  tecnico: boolean = false;
  usuario: boolean = false;
  encargado: boolean = false;

  rolesArray: number[] = [];
  cdr = inject(ChangeDetectorRef);

   async ngOnInit() {

    this.specificRole = await this.getSpecificRole(String(this.user().cn_id_usuario)); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado

    for (let i = 0; i < this.specificRole.length; i++) {
      this.rolesArray.push(this.specificRole[i].cn_id_rol)
      }

    console.log("pr : ",this.rolesArray);
    // this.rolesArray = await this.rolesXusuario();

    this.tecnico = this.rolesArray.includes(4);
    this.usuario = this.rolesArray.includes(2);
    this.encargado = this.rolesArray.includes(3);

    this.cdr.detectChanges();
    // console.log("pruebando : ", this.id_rol_usuario.length);
  }

  //para mostrar los incidente pero no tener que recargar
  ionViewWillEnter(){
    this.getIncidencias();
  }

  //para editar incidente
  async addUpdateIncident(incidencia?: Incidencia){


    let modal = await this.utilService.getModal({
      component: ActualizarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {incidencia}
    })
    
      // para que cargue automaticamente los incidentes agregados
      if(modal) this.getIncidencias();
  }  

  async addDiagnostico(diagnostico?: Diagnostico, incidencia?: Incidencia){

    console.log(incidencia);

    let modal = await this.utilService.getModal({
      component: DiagnosticoIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {diagnostico, incidencia}
    })

  }

  //retorna datos del usuario en el local storage
  user(): User {
    return this.utilService.getLocalStorage('user');
  }

  //llama coleccion de datos (lista de incidencias reportadas)
  getIncidencias(){
  
    let path;
    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        const userPath = `t_usuarios/${this.userId}`; // Asegúrate de que el path sea correcto según tu estructura de datos

        path = `t_incidencias/${this.userId}/t_incidencias`;//ruta de la incidencia
        
        this.loading = true;

        let sub = this.firebaseService.getCollectionData(path)
        .snapshotChanges().pipe(
          map(changes => changes.map( c => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data()
          })))
        ).subscribe({
          next: (resp: any) => {
            this.incidencia = resp;
            this.loading = false;
            sub.unsubscribe();
          }
        })
        this.firebaseService.getDocument(userPath).then(userData => {
          // Si necesitas otros datos del usuario, puedes manejarlos aquí
        }).catch(error => {
          console.error('Error obteniendo datos de usuario:', error);
        });
      }
    });
  }

  // Para refrescar pantalla
  doRefresh(event : any){

    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000)
  }

  // ------------------------------------------Obtienen roles del usuario -----------------------
  getSpecificRole(cn_id_usuario: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getRolUsuario().subscribe(
        data => {
          const specificRole = data.filter(role => role.cn_id_usuario === cn_id_usuario);
          if (specificRole) {
            // console.log(`Rol de ${cn_id_rol}:`, specificRole);
            resolve(specificRole);
          } else {
            // console.log(`Rol de ${cn_id_rol} no encontrado`);
            resolve(null); // Resuelve con null si no se encuentra el rol
          }
        },
        error => {
          console.error('Error al obtener roles:', error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }

  getNameRol(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getRol().subscribe(
        data => {
          const rolesA = data;
         resolve(rolesA);

        },
        error => {
          console.error('Error al obtener roles:', error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }

  async rolesXusuario(){

    this.roles = await this.getNameRol();//obtiene los roles registrados
    this.specificRole = await this.getSpecificRole(String(this.user().cn_id_usuario)); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado

    let arr = [];
    for (let i = 0; i < this.specificRole.length; i++) {
      arr.push(this.specificRole[i].cn_id_rol);

      for (let j = 0; j < this.roles.length; j++) {
        
        if(this.specificRole[i].cn_id_rol === this.roles[j].cn_id_rol){
          console.log("Roles del usuario logueado: ", this.roles[j].ct_descripcion);
        }
      }
    }

    return arr;
  }
  

  // ---------------------------------Asignar inciencia-------------------------------
  async asignarIncidencia(asignaciones?: Asignaciones, incidencia?: Incidencia){

    console.log(incidencia);

    let modal = await this.utilService.getModal({
      component: AsignarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {asignaciones, incidencia}
    })
  }
}
