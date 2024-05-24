import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { administrator } from 'src/app/models/administrator.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilService.loading();
      await loading.present();

      console.log(this.form.value); // Verifica que aquí se imprimen correctamente los valores
      this.firebaseService
        .signIn(this.form.value as User)
        .then((resp) => {
          this.getUserInfo(resp.user.uid);
        })
        .catch((error) => {
          console.error('Login fallido', error);
          this.utilService.presentToast({
            message: error.message,
            duration: 2500,
            color: 'danger',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
        }).finally(() => {
          loading.dismiss();
        });
    }
  }

  //obtiene la informacion del usuario logueado
  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilService.loading();
      await loading.present();

      const path = `t_usuarios/${uid}`;

      this.firebaseService.getDocument(path)
        .then((user: User | undefined) => {
          if (user) {
            this.utilService.saveLocalStorage('user', user);
            this.utilService.routerlink('main/home');
            this.form.reset();

            console.log('ID del usuario logueado',user.cn_id_usuario);

            this.utilService.presentToast({
              message: `Bienvenido ${user.ct_nombre}`,
              duration: 1500,
              color: 'primary',
              position: 'bottom',
              icon: 'person-circle-outline'
            });
          } else {
            throw new Error('User data is undefined');
          }
        }).catch(error => {
          console.error('Error getting user info:', error);
          this.utilService.presentToast({
            message: error.message,
            duration: 2500,
            color: 'danger',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
        }).finally(() => {
          loading.dismiss();
        });
    }
  }
}
