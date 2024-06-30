// Importa Component y OnInit de @angular/core para crear un componente y manejar su inicialización, respectivamente.
// Importa inject para inyectar dependencias sin necesidad de usar el constructor.
import { Component, OnInit, inject } from '@angular/core';
// Importa FormControl, FormGroup, y Validators de @angular/forms para manejar formularios reactivos y validación.
import { FormControl, FormGroup, Validators } from '@angular/forms';
// Importa Router de @angular/router para realizar navegación programática.
import { Router } from '@angular/router';
// Importa Location de @angular/common para interactuar con la URL del navegador.
import { Location } from '@angular/common';
// Importa el modelo User desde una ruta específica.
import { User } from 'src/app/models/user.model';
// Importa FirebaseService desde una ruta específica, un servicio para interactuar con Firebase.
import { FirebaseService } from 'src/app/services/firebase.service';
// Importa UtilsService desde una ruta específica, un servicio para operaciones utilitarias como mostrar toasts.
import { UtilsService } from 'src/app/services/utils.service';

// Decorador Component que define metadatos para el componente AuthPage.
@Component({
  selector: 'app-auth', // Selector CSS para usar el componente.
  templateUrl: './auth.page.html', // Ruta al archivo de plantilla del componente.
  styleUrls: ['./auth.page.scss'], // Ruta a los estilos específicos del componente.
})
// Clase AuthPage que implementa la interfaz OnInit para la inicialización del componente.
export class AuthPage implements OnInit {
  // Inyecta dependencias necesarias usando la función inject.
  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);
  router = inject(Router);
  location = inject(Location);

  // Define un FormGroup para manejar el formulario de autenticación con validaciones.
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  // Método vacío ngOnInit que se ejecuta en la inicialización del componente.
  ngOnInit() {}

  // Método asíncrono submit para manejar la presentación del formulario.
  async submit() {
    // Verifica si el formulario es válido.
    if (this.form.valid) {
      // Muestra un indicador de carga.
      const loading = await this.utilService.loading();
      await loading.present();

      // Intenta iniciar sesión con Firebase usando los valores del formulario.
      this.firebaseService
        .signIn(this.form.value as User)
        .then((resp) => {
          // Si la autenticación es exitosa, obtiene información adicional del usuario.
          this.getUserInfo(resp.user.uid);
        })
        .catch((error) => {
          // Muestra un mensaje de error si la autenticación falla.
          this.utilService.presentToast({
            message: "Correo o contraseña incorrectos",
            duration: 2500,
            color: 'danger',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
        }).finally(() => {
          // Oculta el indicador de carga al finalizar.
          loading.dismiss();
        });
    }
  }

  // Método asíncrono getUserInfo para obtener información adicional del usuario autenticado.
  async getUserInfo(uid: string) {
    // Verifica nuevamente si el formulario es válido.
    if (this.form.valid) {
      // Muestra un indicador de carga.
      const loading = await this.utilService.loading();
      await loading.present();

      // Define la ruta del documento del usuario en Firebase.
      const path = `t_usuarios/${uid}`;

      // Intenta obtener el documento del usuario desde Firebase.
      this.firebaseService.getDocument(path)
        .then((user: User | undefined) => {
          // Si el usuario existe, guarda su información en el almacenamiento local y redirige.
          if (user) {
            this.utilService.saveLocalStorage('user', user);
            setTimeout(() => {
              this.router.navigateByUrl('/empty');
            }, 1000);
           
            // Resetea el formulario.
            this.form.reset();
          } else {
            // Lanza un error si los datos del usuario no están definidos.
            throw new Error('Los datos del usuario no están definidos.');
          }
        }).catch(error => {
          // Muestra un mensaje de error si falla la obtención de datos del usuario.
          this.utilService.presentToast({
            message: "Error en datos de usuario",
            duration: 2500,
            color: 'danger',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
        }).finally(() => {
          // Oculta el indicador de carga al finalizar.
          loading.dismiss();
        });
    }
  }
}