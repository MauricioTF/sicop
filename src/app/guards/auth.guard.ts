// Importa el decorador Injectable de Angular para marcar la clase como disponible para ser provista e inyectada como una dependencia.
import { Injectable } from '@angular/core';
// Importa la función inject de Angular para inyectar dependencias sin necesidad de usar el constructor.
import { inject } from '@angular/core';
// Importa varias interfaces de Angular Router para manejar la activación de rutas.
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, UrlTree } from '@angular/router';
// Importa Observable de la librería RxJS, que es utilizado para manejar operaciones asíncronas.
import { Observable } from 'rxjs';
// Importa FirebaseService, un servicio personalizado para interactuar con Firebase.
import { FirebaseService } from '../services/firebase.service';

// Marca la clase como inyectable y especifica que debe ser provista en el 'root' (nivel global de la aplicación).
@Injectable({
  providedIn: 'root'
})
// Define la clase AuthGuard que implementa la interfaz CanActivate para decidir si una ruta puede ser activada.
export class AuthGuard implements CanActivate {
  // Inyecta una instancia de FirebaseService usando la función inject de Angular.
  firebaseService = inject(FirebaseService);

  // Define el método canActivate, que determina si la ruta solicitada puede ser activada.
  canActivate(
    route: ActivatedRouteSnapshot, // Información sobre la ruta activa.
    state: RouterStateSnapshot // Estado del router en un momento dado.
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Intenta obtener el usuario desde el almacenamiento local.
    let user = localStorage.getItem('user');

    // Retorna una promesa que se resuelve con un valor booleano o UrlTree.
    return new Promise((resolve) => {
      // Observa el estado de autenticación del usuario con Firebase.
      this.firebaseService.getAuth().onAuthStateChanged((auth) => {
        if (auth) { // Si hay un usuario autenticado...
          if(user)resolve(true); // Y si hay información de usuario en el almacenamiento local, resuelve true.
        } else { // Si no hay un usuario autenticado...
          this.firebaseService.signOut(); // Invoca signOut en FirebaseService para cerrar la sesión.
          resolve(false); // Resuelve la promesa como false, impidiendo el acceso a la ruta.
        }
      });
    }); 
  }
}