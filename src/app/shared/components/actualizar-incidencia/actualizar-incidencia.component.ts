import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { administrator } from 'src/app/models/administrator.model';
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

  //usuario
  t_usuarios = {} as User;
  //incidencia
  t_incidencia = {} as Incidencia;
  userId: string | null = null;

  form = new FormGroup({
    cn_id_incidencia: new FormControl('1'),
    cn_id_usuario: new FormControl(''),
    cn_id_estado: new FormControl(''),
    cn_id_afectacion: new FormControl(''),
    cn_id_riesgo: new FormControl(''),
    cn_id_prioridad: new FormControl(''),
    cn_id_categoria: new FormControl(''),
    ct_id_img: new FormControl('', [Validators.required]),
    ct_titulo: new FormControl('', [Validators.required]),
    ct_descripcion: new FormControl('', [Validators.required]),
    ct_lugar: new FormControl('', [Validators.required]),
    ct_justificacion_cierre: new FormControl(''),
    cn_monto: new FormControl(''),
    cn_numero_incidente: new FormControl(''),
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

  //obtiene id de usuario logueado
  

  async submit() {
    console.log(this.form.value);
    this.crearIncidencia();
    //   if (this.form.valid) {
    //     const loading = await this.utilService.loading();
    //     await loading.present();

    //     // this.firebaseService
    //     //   .signIn(this.form.value as User)
    //     //   .then((resp) => {
    //     //     this.getUserInfo(resp.user.uid);
    //     //   })
    //     //   .catch((error) => {
    //     //     console.error('Login fallido', error);
    //     //     this.utilService.presentToast({
    //     //       message: error.message,
    //     //       duration: 2500,
    //     //       color: 'danger',
    //     //       position: 'bottom',
    //     //       icon: 'alert-circle-outline'
    //     //     });
    //     //   }).finally(() => {
    //     //     loading.dismiss();
    //     //   });
    //   }
  }

  //para crear incidencia
  async crearIncidencia() {
    let path = `t_incidencias/${this.t_incidencia.uid}/t_incidencias`;

    const loading = await this.utilService.loading();
    await loading.present();

    this.firebaseService
      .addDocument(path, this.form.value)
      .then(async (resp) => {

        this.utilService.dismissModal({success: true});

        this.utilService.presentToast({
          message: `Incidencte agregado de manera exitosa`,
          duration: 1500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        console.error('Error getting user info:', error);
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

  //para obtener las fotos
  async takeImage() {
    const dataUrl = (
      await this.utilService.takePicture('Foto de la incidencia')
    ).dataUrl; //extrae la respuesta que se selecciona
    this.form.controls.ct_id_img.setValue(dataUrl);
  }

}
