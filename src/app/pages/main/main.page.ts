// Importación de módulos y servicios necesarios
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

// Decorador de Componente que define metadatos para el componente
@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  specificRole: any;
  roles: any;
  rolesArray: number[] = [];

  administrador: boolean = false;
  usuario: boolean = false;
  encargado: boolean = false;
  tecnico: boolean = false;
  supervisor: boolean = false;

  // Inyección de servicios y definición de variables
  router = inject(Router);
  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);
  // Variable que indica la ruta actual
  currentPath: string = '';

  // Definición de las rutas de la aplicación
  // pages  = [
  //   {title:'Inicio', url: '/main/home', icon:'home-outline', visible:this.usuario},
  //   {title:'Diagnosticos', url: '/main/profile', icon:'person-outline', "visible":this.tecnico},
  // ]

  // Método que se ejecuta al inicializar el componente
  async ngOnInit() {

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.currentPath = (event as NavigationEnd).urlAfterRedirects;
    });

    ///////////////////////////////////////////////////////////////////

    // Suscripción a los eventos del router para actualizar la ruta actual
    this.router.events.subscribe((event:any) =>{
      if(event?.url) this.currentPath = event.url
    })

    this.specificRole = await this.firebaseService.getSpecificRole(String(this.user().cn_id_usuario)); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado

    console.log("desde main ", this.specificRole)
  for (let i = 0; i < this.specificRole.length; i++) {
    this.rolesArray.push(this.specificRole[i].cn_id_rol)
  }

  this.administrador = this.rolesArray.includes(1);
  this.usuario = this.rolesArray.includes(2);
  this.encargado = this.rolesArray.includes(3);
  this.tecnico = this.rolesArray.includes(4);
  this.supervisor = this.rolesArray.includes(5);
  }

  // Método para cerrar la sesión
  signOut(){
    this.firebaseService.signOut();
  }

  // Método para obtener los datos del usuario del almacenamiento local
  user(): User{
    return this.utilService.getLocalStorage('user');
  }

      // Método para obtener los roles del usuario  logueado
      async rolesXusuario(){

        this.roles = await this.firebaseService.getNameRol();//obtiene los roles registrados
        this.specificRole = await this.firebaseService.getSpecificRole(String(this.user().cn_id_usuario)); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado
    
        let arr = [];
        for (let i = 0; i < this.specificRole.length; i++) {
          arr.push(this.specificRole[i].cn_id_rol);
    
          for (let j = 0; j < this.roles.length; j++) {
            
            if(this.specificRole[i].cn_id_rol === this.roles[j].cn_id_rol){
              console.log("Roles del usuario logueado: ", this.roles[j].ct_descripcion);
            }
          }
        }
    
        return arr;
      }
}