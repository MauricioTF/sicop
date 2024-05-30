import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
@Component({
  selector: 'app-asignar-incidencia',
  templateUrl: './asignar-incidencia.component.html',
  styleUrls: ['./asignar-incidencia.component.scss'],
})
export class AsignarIncidenciaComponent  implements OnInit {

  @Input() incidencia: Incidencia;

  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);

  // Usuario
  t_usuarios = {} as User;
  // Incidencia
  t_incidencia = {} as Incidencia;
  userId: string | null = null;

  specificRole: any;
  usuarios: any;
  id_rol_usuario : any;

  tecnicos: User[] = [];
  selectedTecnicoId: string | null = null;

  form = new FormGroup({
    cn_id_asignacion_incidencia: new FormControl(1),
    cn_id_usuario: new FormControl(null),
    cn_id_incidencia: new FormControl(null),
  });

  async ngOnInit() {

    this.form.controls.cn_id_incidencia.setValue(this.incidencia['id']);
    this.tecnicos = await this.rolesXusuario();

  }

  async submit() {

        // Asignar el valor seleccionado del ion-select al formControl
        const selectedTecnicoId = this.form.get('cn_id_usuario')?.value;
        this.form.controls['cn_id_usuario'].setValue(selectedTecnicoId);

    //otorga hora de CR
    // this.form.controls.cf_fecha_hora.setValue(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    this.asignarIncidencia();
  }

  
  //retorna datos del usuario en el local storage
  user(): User {
    return this.utilService.getLocalStorage('user');
  }

  // Para crear incidencia
  async asignarIncidencia() {

    let path = `t_asignacion_incidencia/${this.user().cn_id_usuario}/t_asignacion_incidencia`;
    
    console.log('Path de la incidencia asignacion:', path);

    const loading = await this.utilService.loading();
    await loading.present();

    this.firebaseService
      .addDocument(path, this.form.value)
      .then(async (resp) => {
        this.utilService.dismissModal({ success: true });//para cerrar el modal automaticamente

        //mensaje de exito al guardar los datos
        this.utilService.presentToast({
          message: 'Asignacion de incidencia agregada de manera exitosa',
          duration: 1500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });
      })
      //mensaje de error al guardar los datos
      .catch((error) => {
        console.error('Error al asignar incidencia:', error);
        this.utilService.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

// --------------------------------------obtener datos de los tecnicos
// -------------------------------------obtener los usuario que tengan el rol de tecnico

// obtenemos todos los usuario registrados
getTecnicos(): Promise<any> {
  return new Promise((resolve, reject) => {
    this.firebaseService.getTecnicos().subscribe(
      data => {
        const tecnicos = data;
       resolve(tecnicos);
        console.log("Todos los usuarios ",tecnicos);
      },
      error => {
        console.error('Error al obtener roles:', error);
        reject(error); // Rechaza la promesa en caso de error
      }
    );
  });
}

// obtenemos los roles que tiene cada usuario para saber si es técnico
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

async rolesXusuario(){

  this.usuarios = await this.getTecnicos();//obtiene los roles registrados

  let u_tecnios = [];

  // recorro los tecnicos para acceder a sus id
  for (let i = 0; i < this.usuarios.length; i++) {

    // asignamos a specific rol el rol con cada usuario
    this.specificRole = await this.getSpecificRole(this.usuarios[i].cn_id_usuario); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado

  // recorremos a los roles de cada usuario
  for (let j = 0; j < this.specificRole.length; j++) {

    // consultamos si el usuario tiene rol de tecnico
    if(this.specificRole[j].cn_id_rol === 4){
      // agregamos al arreglo el id del usuario con rol de tenico
      u_tecnios.push(this.usuarios[i]);
    }

  }

}
  console.log("Usuarios con rol de tecnico ",u_tecnios);

   return u_tecnios;
}

}
