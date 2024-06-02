// Importación de módulos y servicios necesarios
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
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

  // Inyección de servicios y definición de variables
  router = inject(Router);
  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);
  // Variable que indica la ruta actual
  currentPath: string = '';

  // Definición de las rutas de la aplicación
  pages  = [
    {title:'Inicio', url: '/main/home', icon:'home-outline'},
    {title:'Perfil', url: '/main/profile', icon:'person-outline'},
    {title:'Registrar usuario', url: '/main/registrar-usuario', icon:'person-outline'}
  ]

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    // Suscripción a los eventos del router para actualizar la ruta actual
    this.router.events.subscribe((event:any) =>{
      if(event?.url) this.currentPath = event.url
    })
  }

  // Método para cerrar la sesión
  signOut(){
    this.firebaseService.signOut();
  }

  // Método para obtener los datos del usuario del almacenamiento local
  user(): User{
    return this.utilService.getLocalStorage('user');
  }
}