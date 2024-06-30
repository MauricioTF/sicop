import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.page.html',
  styleUrls: ['./empty.page.scss'],
})

//se utiliza como splash (ocupa el tiempo de carga del sistema) para mostrar otra pantalla
export class EmptyPage implements OnInit {

  router = inject(Router); // Inyecta Router

  utilService = inject(UtilsService);

  ngOnInit() {
      //cuando inicie sesion pase a auth
      setTimeout(() => {
        this.router.navigateByUrl('main/home');
      }, 1500);

      this.utilService.presentToast({
        message: `Bienvenido ${this.user().ct_nombre}`,
        duration: 2000,
        color: 'primary',
        position: 'bottom',
        icon: 'person-circle-outline'
        
      });
  }

    user(): User {
      return this.utilService.getLocalStorage('user');
    }

}
