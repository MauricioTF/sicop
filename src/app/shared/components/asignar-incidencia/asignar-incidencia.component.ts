// Importación de módulos y servicios necesarios
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

// Decorador Component que define la configuración del componente
@Component({
  selector: 'app-asignar-incidencia',
  templateUrl: './asignar-incidencia.component.html',
  styleUrls: ['./asignar-incidencia.component.scss'],
})

export class AsignarIncidenciaComponent  implements OnInit {

    // Inyección de servicios y definición de variables
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
  asignacion: any;
  id_rol_usuario : any;

  tecnicos: User[] = [];
  selectedTecnicoId: string | null = null;
  u_asignaciones = [];

  idUsuarios: any;

    // Definición del formulario
  form = new FormGroup({
    cn_id_asignacion_incidencia: new FormControl(1),
    cn_id_usuario: new FormControl(null, [Validators.required]),
    cn_id_incidencia: new FormControl(null),

    // Tabla de incidencias
    cn_id_afectacion: new FormControl('', []),
    cn_id_categoria: new FormControl('', []),
    cn_id_prioridad: new FormControl('', []),
    cn_id_riesgo: new FormControl('', []),
  });

    // Método que se ejecuta al inicializar el componente
  async ngOnInit() {

    this.form.controls.cn_id_incidencia.setValue(this.incidencia['id']);
    this.tecnicos = await this.rolesXusuario();

    //para quitar los tecnicos que ya fuerion asignados a la incidencia
    for (let i = 0; i < this.u_asignaciones.length; i++) {
      for (let j = 0; j < this.tecnicos.length; j++) {
        if(this.u_asignaciones[i].cn_id_incidencia === this.incidencia['id'] && this.tecnicos[j].cn_id_usuario === this.u_asignaciones[i].cn_id_usuario){

          this.tecnicos.splice(j, 1);

        }
      
    }
  }
}

    // Método que se ejecuta al enviar el formulario
  async submit() {

        // Asignar el valor seleccionado del ion-select al formControl
        const selectedTecnicoId = this.form.get('cn_id_usuario')?.value;

        this.form.controls['cn_id_usuario'].setValue(selectedTecnicoId);


        await this.firebaseService.actualizaTabla(this.incidencia['id'], String(this.incidencia['cn_id_usuario']), {
          cn_id_afectacion: this.form.value.cn_id_afectacion,
          cn_id_categoria: this.form.value.cn_id_categoria,
          cn_id_prioridad: this.form.value.cn_id_prioridad,
          cn_id_riesgo: this.form.value.cn_id_riesgo,

        });
        
    //otorga hora de CR
    // this.form.controls.cf_fecha_hora.setValue(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    this.asignarIncidencia();
  }

  // Método para obtener el usuario actual
  user(): User {
    return this.utilService.getLocalStorage('user');
  }

  // Método para asignar la incidencia
  async asignarIncidencia() {

    let path = `t_asignacion_incidencia/${this.user().cn_id_usuario}/t_asignacion_incidencia`;
    
    const loading = await this.utilService.loading();
    await loading.present();

    this.firebaseService
      .addDocument(path, this.form.value)
      .then(async (resp) => {
        this.utilService.dismissModal({ success: true });//para cerrar el modal automaticamente

        // Cambia el estado de la incidencia al asignarla
        this.firebaseService.actualizaTabla(this.incidencia['id'], String(this.incidencia['cn_id_usuario']), { cn_id_estado: 2 });

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
          message: 'Error al asignar incidencia, intente nuevamente.',
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

  // Método para obtener los técnicos
  getTecnicos(): Promise<any> {
  return new Promise((resolve, reject) => {
    this.firebaseService.getTecnicos().subscribe(
      data => {
        const tecnicos = data;
       resolve(tecnicos);
      },
      error => {
        console.error('Error al obtener roles:', error);
        reject(error); // Rechaza la promesa en caso de error
      }
    );
  });
}

  // Método para obtener los roles de los usuarios
async rolesXusuario(){

  this.usuarios = await this.getTecnicos();//obtiene los roles registrados

  let u_tecnios = [];
  

  // recorro los tecnicos para acceder a sus id
  for (let i = 0; i < this.usuarios.length; i++) {

    this.asignacion = await this.getAsignaciones(this.usuarios[i].cn_id_usuario);//obtiene las asignaciones registradas
   
    for (let j = 0; j < this.asignacion.length; j++) {

      this.u_asignaciones.push(this.asignacion[j]);
    }

    // asignamos a specific rol el rol con cada usuario
    this.specificRole = await this.firebaseService.getSpecificRole(this.usuarios[i].cn_id_usuario); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado

  // recorremos a los roles de cada usuario
  for (let j = 0; j < this.specificRole.length; j++) {

    // consultamos si el usuario tiene rol de tecnico
    if(this.specificRole[j].cn_id_rol === 4){
      // agregamos al arreglo el id del usuario con rol de tenico
      u_tecnios.push(this.usuarios[i]);
    }

  }

}

   return u_tecnios;
}

getAsignaciones(uid): Promise<any> {
  return new Promise((resolve, reject) => {
    this.firebaseService.getAsignaciones(uid).subscribe(
      data => {
        const asignacion = data;
       resolve(asignacion);

      },
      error => {
        console.error('Error al obtener roles:', error);
        reject(error); // Rechaza la promesa en caso de error
      }
    );
  });
}

datoVacio(field: any | null | undefined): boolean {
  return field === null || field === undefined || field.trim() === '';
}

}
