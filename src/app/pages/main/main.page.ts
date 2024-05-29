import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

   //para no usar el constructor
   router = inject(Router);
   firebaseService = inject(FirebaseService);
   utilService = inject(UtilsService);
   //me indica hacia donde estoy navegando
   currentPath: string = '';
 
   //se declaran las rutas hacia donde se quiere desplazar, se crea objeto con sus propiedades
   //cada uno lleva el titulo del componente hijo, la url donde se ubica cada uno y un icono a eleccion
   
   pages  = [
     {title:'Inicio', url: '/main/home', icon:'home-outline'},
     {title:'Perfil', url: '/main/profile', icon:'person-outline'},
     {title:'Registrar usuario', url: '/main/registrar-usuario', icon:'person-outline'}

   ]

   //esto debe traer la navegacion entre componentes
   ngOnInit() {

     this.router.events.subscribe((event:any) =>{
       //consulta si la url a la que se desa acceder existe
       if(event?.url)this.currentPath = event.url
      
     })

   }

   //cierra sesion
   signOut(){
    this.firebaseService.signOut();
   }

  //obtiene datos del usuario del local storage
  user(): User{
    return this.utilService.getLocalStorage('user');
  }

}
