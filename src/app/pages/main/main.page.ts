// Importación de módulos y servicios necesarios
import { Component, OnInit, inject } from '@angular/core'; // Importa Component, OnInit para el ciclo de vida del componente, e inject para inyectar servicios
import { NavigationEnd, Router } from '@angular/router'; // Importa NavigationEnd para eventos de navegación y Router para manejo de rutas
import { filter } from 'rxjs'; // Importa filter de rxjs para filtrar eventos
import { User } from 'src/app/models/user.model'; // Importa el modelo User
import { FirebaseService } from 'src/app/services/firebase.service'; // Importa FirebaseService para interactuar con Firebase
import { UtilsService } from 'src/app/services/utils.service'; // Importa UtilsService para utilizar utilidades generales

// Decorador de Componente que define metadatos para el componente
@Component({
  selector: 'app-main', // Selector CSS para el componente
  templateUrl: './main.page.html', // Ruta al archivo de plantilla del componente
  styleUrls: ['./main.page.scss'], // Rutas a los archivos de estilos del componente
})
export class MainPage implements OnInit { // Define la clase MainPage que implementa OnInit

  specificRole: any; // Variable para almacenar roles específicos
  roles: any; // Variable para almacenar roles
  rolesArray: number[] = []; // Array para almacenar los ID de roles

  // Variables booleanas para determinar la visibilidad basada en roles
  administrador: boolean = false;
  usuario: boolean = false;
  encargado: boolean = false;
  tecnico: boolean = false;
  supervisor: boolean = false;

  // Inyección de servicios y definición de variables
  router = inject(Router); // Inyecta el servicio Router
  firebaseService = inject(FirebaseService); // Inyecta el servicio FirebaseService
  utilService = inject(UtilsService); // Inyecta el servicio UtilsService
  currentPath: string = ''; // Variable que indica la ruta actual

  // Método que se ejecuta al inicializar el componente
  async ngOnInit() {

    // Suscribe al evento de cambio de ruta para actualizar la ruta actual
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.currentPath = (event as NavigationEnd).urlAfterRedirects;
    });

    // Suscripción a los eventos del router para actualizar la ruta actual
    this.router.events.subscribe((event:any) =>{
      if(event?.url) this.currentPath = event.url
    })

    // Obtiene el rol específico del usuario y actualiza las variables de roles
    this.specificRole = await this.firebaseService.getSpecificRole(String(this.user().cn_id_usuario));
    for (let i = 0; i < this.specificRole.length; i++) {
      this.rolesArray.push(this.specificRole[i].cn_id_rol)
    }

    // Actualiza las variables booleanas de roles basadas en los roles del usuario
    this.administrador = this.rolesArray.includes(1);
    this.usuario = this.rolesArray.includes(2);
    this.encargado = this.rolesArray.includes(3);
    this.tecnico = this.rolesArray.includes(4);
    this.supervisor = this.rolesArray.includes(5);
  }

  // Método para cerrar la sesión
  signOut(){
    this.firebaseService.signOut(); // Llama al método signOut de FirebaseService
  }

  // Método para obtener los datos del usuario del almacenamiento local
  user(): User{
    return this.utilService.getLocalStorage('user'); // Retorna el usuario almacenado en el localStorage
  }

  // Método para obtener los roles del usuario logueado
  async rolesXusuario(){

    // Obtiene los roles registrados y el rol específico del usuario
    this.roles = await this.firebaseService.getNameRol();
    this.specificRole = await this.firebaseService.getSpecificRole(String(this.user().cn_id_usuario));

    let arr = [];
    for (let i = 0; i < this.specificRole.length; i++) {
      arr.push(this.specificRole[i].cn_id_rol);

      // Imprime los roles del usuario logueado
      for (let j = 0; j < this.roles.length; j++) {
        if(this.specificRole[i].cn_id_rol === this.roles[j].cn_id_rol){
          console.log("Roles del usuario logueado: ", this.roles[j].ct_descripcion);
        }
      }
    }

    return arr; // Retorna el array de roles
  }
}