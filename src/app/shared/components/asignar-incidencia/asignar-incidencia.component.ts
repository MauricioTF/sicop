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

  form = new FormGroup({
    cn_id_asignacion_incidencia: new FormControl(1),
    cn_id_usuario: new FormControl(null),
    cn_id_incidencia: new FormControl(null),
  });

  ngOnInit() {
    this.form.controls.cn_id_incidencia.setValue(this.incidencia['id']);

    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        const userPath = `t_usuarios/${this.userId}`; // Asegúrate de que el path sea correcto según tu estructura de datos

        this.firebaseService.getDocument(userPath).then(userData => {
          this.form.controls.cn_id_usuario.setValue(this.userId);

        }).catch(error => {
          console.error('Error obteniendo datos de usuario:', error);
        });
      }
    });
  }

  async submit() {

    //otorga hora de CR
    // this.form.controls.cf_fecha_hora.setValue(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    this.crearIncidencia();
  }

  // Para crear incidencia
  async crearIncidencia() {

    if (!this.userId) {
      console.error('El UID del usuario no está definido');
      this.utilService.presentToast({
        message: 'Error: El UID del usuario no está definido',
        duration: 2500,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
      return;
    }

    let path = `t_asignacion_incidencia/${this.userId}/t_asignacion_incidencia`;
    
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


}
