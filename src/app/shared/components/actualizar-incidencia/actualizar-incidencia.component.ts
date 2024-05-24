import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { administrator } from 'src/app/models/administrator.model';
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

  form = new FormGroup({
    cn_id_incidencia: new FormControl(''),
    //cn_id_usuario: new FormControl('', [Validators.required]),
    //cn_id_estado: new FormControl('', [Validators.required]),
    //cn_id_afectacion: new FormControl('', [Validators.required]),
    //cn_id_riesgo: new FormControl('', [Validators.required]),
    //cn_id_prioridad: new FormControl('', [Validators.required]),
    //cn_id_categoria: new FormControl('', [Validators.required]),
    // ct_id_img: new FormControl('', [Validators.required]),
    ct_descripcion: new FormControl('', [Validators.required]),
    ct_lugar: new FormControl('', [Validators.required]),
    //ct_justificacion_cierre: new FormControl('', [Validators.required]),
    //cn_monto: new FormControl('', [Validators.required]),
    //cn_numero_incidente: new FormControl('', [Validators.required]),

  });

  ngOnInit() {}

  async submit() {
    console.log(this.form.value);
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
  }
