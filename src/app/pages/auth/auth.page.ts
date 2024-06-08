import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; // Importa Location
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
  router = inject(Router);
  location = inject(Location); // Inyecta Location

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilService.loading();
      await loading.present();

      this.firebaseService
        .signIn(this.form.value as User)
        .then((resp) => {
          this.getUserInfo(resp.user.uid);
        })
        .catch((error) => {
          this.utilService.presentToast({
            message: "Correo o contraseña incorrectos",
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

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilService.loading();
      await loading.present();

      const path = `t_usuarios/${uid}`;

      this.firebaseService.getDocument(path)
        .then((user: User | undefined) => {
          if (user) {
            this.utilService.saveLocalStorage('user', user);
            setTimeout(() => {
              this.router.navigateByUrl('main/home');
            }, 1);
            // this.router.navigateByUrl('main/home').then(() => {
              // Recargar la página de inicio
              // this.location.go(this.location.path());
              // window.location.reload();
            // });
            this.form.reset();

            this.utilService.presentToast({
              message: `Bienvenido ${user.ct_nombre}`,
              duration: 1500,
              color: 'primary',
              position: 'bottom',
              icon: 'person-circle-outline'
              
            });
          
          } else {
            throw new Error('Los datos del usuario no están definidos.');
          }

        }).catch(error => {
          this.utilService.presentToast({
            message: "Error en datos de usuario",
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
