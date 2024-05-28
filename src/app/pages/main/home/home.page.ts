import { Component, OnInit, inject } from '@angular/core';
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
  roles : Rol[] = [];

  form: any;
  rolesIncidencias: string[] = [];


   ngOnInit() {

    // this.getIncidencias()
    // console.log(    this.getRolesIncidencias(String(this.user1().cn_id_usuario)));
    // this.mostrarRolesAsignados();
    // console.log(this.rolesIncidencias);
    this.getRoles();
  }

  //para mostrar los incidente pero no tener que recargar
  ionViewWillEnter(){
    this.getIncidencias();
  }


  //para editar incidente
  async addUpdateIncident(incidencia?: Incidencia){

    console.log(incidencia);

    let modal = await this.utilService.getModal({
      component: ActualizarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {incidencia}
    })
    
      // para que cargue automaticamente los incidentes agregados
      if(modal) this.getIncidencias();
  }  

  async addDiagnostico(diagnostico?: Diagnostico, incidencia?: Incidencia){

    let modal = await this.utilService.getModal({
      component: DiagnosticoIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {diagnostico, incidencia}
    })

  }

  //--------------------------------------------------------------------------------------

//   rol_user(cn_id_usuario: string){ 
//     let roles_asignados = []; 
//     let rol = 0;  
//     this.firebaseService.getRolUsuario().subscribe(data => {
//       let specificRole = data.filter(role => role.cn_id_usuario === cn_id_usuario);

//         this.firebaseService.getRol().subscribe(data => {

//           //vamos a obtener los nombres de los roles que tiene el usuario
//         //acá recorremos los roles del usuario
//         for (let i = 0; i < specificRole.length; i++) {
//         //recorremos la lista de roles
//           for (let j = 0; j < data.length; j++) {
            
//             if(specificRole[i].cn_id_rol === data[j].cn_id_rol){
//               console.log("Pru ls", specificRole[i].cn_id_rol);
//               if(specificRole[i].cn_id_rol === 2){
//                 rol = 2;
//               }

//               roles_asignados.push(data[j].ct_descripcion);
//             }
//           }
//         }

//         });
//         console.log("ROL HOME", rol);

//         return rol;
//     });
//     // return roles_asignados;
// }


// _-----------------------------

  //-------------------------------------------------------------------------------------

  //retorna datos del usuario en el local storage
  user(): User {
    return this.utilService.getLocalStorage('t_usuarios');
  }

    //obtiene datos del usuario del local storage
    user1(): User{
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
  
  // -------------------------------------------------- lista de roles
    //llama coleccion de datos (lista de incidencias reportadas)
    getRoles(){

      let path = `t_roles`;

      this.loading = true;

      let sub = this.firebaseService.getCollectionData(path)
        .snapshotChanges().pipe(
          map(changes => changes.map( c=> ({
            id: c.payload.doc.id,
            ...c.payload.doc.data()
          })))
        ).subscribe({
          next:(resp:any) => {
            this.roles = resp
            console.log(this.roles);
          }
        })
    }

  // Para refrescar pantalla
  doRefresh(event : any){

    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000)
  }

  
}
