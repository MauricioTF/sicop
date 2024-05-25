import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-actualizar-incidencia',
  templateUrl: './actualizar-incidencia.component.html',
  styleUrls: ['./actualizar-incidencia.component.scss'],
})
export class ActualizarIncidenciaComponent implements OnInit {

  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);

  // Usuario
  t_usuarios = {} as User;
  // Incidencia
  t_incidencia = {} as Incidencia;
  userId: string | null = null;

  form = new FormGroup({
    cn_id_incidencia: new FormControl(1),
    cn_id_usuario: new FormControl(null),
    cn_id_estado: new FormControl(null),
    cn_id_afectacion: new FormControl(null),
    cf_fecha_hora: new FormControl(null),
    cn_id_riesgo: new FormControl(null),
    cn_id_prioridad: new FormControl(null),
    cn_id_categoria: new FormControl(null),
    ct_id_img: new FormControl('', [Validators.required]),
    ct_titulo: new FormControl('', [Validators.required]),
    ct_descripcion: new FormControl('', [Validators.required]),
    ct_lugar: new FormControl('', [Validators.required]),
    ct_justificacion_cierre: new FormControl(''),
    cn_monto: new FormControl(null),
    cn_numero_incidente: new FormControl(null),
  });

  ngOnInit() {
    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        const userPath = `t_usuarios/${this.userId}`; // Asegúrate de que el path sea correcto según tu estructura de datos

        this.firebaseService.getDocument(userPath).then(userData => {
          this.form.controls.cn_id_usuario.setValue(this.userId);
          // Si necesitas otros datos del usuario, puedes manejarlos aquí
        }).catch(error => {
          console.error('Error getting user data:', error);
        });
      }
    });
  }

  async submit() {

    //otorga hora de CR
    this.form.controls.cf_fecha_hora.setValue(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
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

    let path = `t_incidencias/${this.userId}/t_incidencias`;
    
    console.log('Path de la incidencia:', path);

    const loading = await this.utilService.loading();
    await loading.present();

    let dataUrl = this.form.value.ct_id_img;//valor de la imagen seleccionada
    let imgPath = `${this.userId}/${Date.now()}`//path unico para la imagen
    let imgUrl = await this.firebaseService.updateImg(imgPath, dataUrl);
 
    this.form.controls.ct_id_img.setValue(imgUrl);
    //delete this.form.value.cn_id_incidencia; // Elimina el id y toma el uid creado

    console.log('Datos del formulario antes de agregar:', this.form.value);

    this.firebaseService
      .addDocument(path, this.form.value)
      .then(async (resp) => {
        this.utilService.dismissModal({ success: true });//para cerrar el modal automaticamente

        //mensaje de exito al guardar los datos
        this.utilService.presentToast({
          message: 'Incidencia agregada de manera exitosa',
          duration: 1500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });
      })
      //mensaje de error al guardar los datos
      .catch((error) => {
        console.error('Error al agregar la incidencia:', error);
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

  // Para obtener las fotos
  async takeImage() {
    const dataUrl = (
      await this.utilService.takePicture('Foto de la incidencia')
    ).dataUrl; // Extrae la respuesta que se selecciona
    this.form.controls.ct_id_img.setValue(dataUrl);
  }

}
