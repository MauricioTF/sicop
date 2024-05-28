import { Component, OnInit, inject } from '@angular/core';
import { User } from 'firebase/auth';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.component.html',
  styleUrls: ['./registrar-usuario.component.scss'],
})
export class RegistrarUsuarioComponent  implements OnInit {

  constructor() { }

  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);
  form: any;

  
  ngOnInit() {}

  
  async submitUsuario(){
    this.crearUsuario();
  }
    //obtiene datos del usuario del local storage
    user(): User{
      return this.utilService.getLocalStorage('user');
    }
    
  async crearUsuario(){

    let path = `t_usuarios/${this.user().uid}/t_usuarios`
    const loading = await this.utilService.loading();
    await loading.present();

    this.firebaseService.addDocument(path, this.form.value)
    .then(async resp => {
      this.utilService.dismissModal({success:true});

      this.utilService.presentToast({
        message: `Usuario creado de manera exitosa `,
        duration: 1500,
        color: 'primary',
        position: 'bottom',
        icon: 'checkmark-circle-outline'

      })
    }).catch(error => {

      this.utilService.presentToast({
        message: `Error al crear usuario`,
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      })
    }).finally(() => {
      loading.dismiss();
    })

  }
}
