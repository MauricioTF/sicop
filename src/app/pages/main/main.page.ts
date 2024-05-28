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


  rol(){
    this.firebaseService.getRol().subscribe(data => {
      //de esta manera obtenemos un dato especifico de un registro especifico
      // console.log('Roles:', data[1].cn_id_rol);
      // console.log("tamaño ",data.length);
      return data;
    });
  }

  getSpecificRole(cn_id_rol: string) {
    this.firebaseService.getRol().subscribe(data => {
      const specificRole = data.find(role => role.cn_id_rol === cn_id_rol);
      if (specificRole) {
        console.log(`Role with cn_id_rol ${cn_id_rol}:`, specificRole);
      } else {
        console.log(`Role with cn_id_rol ${cn_id_rol} not found`);
      }
    });
  }
}
