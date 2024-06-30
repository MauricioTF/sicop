// Importación de módulos y servicios necesarios
import { Component, OnInit, inject } from '@angular/core'; // Importa Component, OnInit para el ciclo de vida del componente, inject para inyectar servicios
import { UtilsService } from 'src/app/services/utils.service'; // Importa UtilsService para utilizar sus funciones de utilidad
import { FirebaseService } from 'src/app/services/firebase.service'; // Importa FirebaseService para interactuar con Firebase
import { User } from 'src/app/models/user.model'; // Importa el modelo User para tipar los datos del usuario
import { map } from 'rxjs'; // Importa map de rxjs para transformar los datos de los observables
import { Diagnostico } from 'src/app/models/diagnostico.model'; // Importa el modelo Diagnostico para tipar los datos de diagnóstico

import { Location } from '@angular/common'; // Importa Location para interactuar con la URL del navegador

@Component({
  selector: 'app-profile', // Define el selector del componente
  templateUrl: './profile.page.html', // Define la ruta del archivo de plantilla
  styleUrls: ['./profile.page.scss'], // Define la ruta del archivo de estilos
})
export class ProfilePage implements OnInit { // Declara la clase ProfilePage que implementa OnInit

  firebaseService = inject(FirebaseService); // Inyecta FirebaseService en la propiedad firebaseService
  utilService = inject(UtilsService); // Inyecta UtilsService en la propiedad utilService
  location = inject(Location); // Inyecta Location en la propiedad location
  loading: boolean = false; // Declara la propiedad loading para controlar la visualización de indicadores de carga
  diagnostico : Diagnostico[] = []; // Declara la propiedad diagnostico para almacenar los diagnósticos obtenidos

  ngOnInit() { // Método vacío del ciclo de vida OnInit
  }

    // Método que se ejecuta cuando la vista está a punto de entrar y volverse la vista activa
    ionViewWillEnter(){
    
      this.getDiagnosticos(); // Llama al método getDiagnosticos al entrar a la vista
    }
  
    // Método para obtener los datos del usuario del almacenamiento local
    user(): User {
      return this.utilService.getLocalStorage('user'); // Retorna los datos del usuario almacenados localmente
    }
    
    // Método para obtener la lista de diagnósticos reportados
    getDiagnosticos(){
  
      let path; // Declara la variable path para almacenar la ruta de acceso a los diagnósticos
      this.firebaseService.getCurrentUser().subscribe(user => { // Obtiene el usuario actual de Firebase
        if (user) { // Si hay un usuario

          const userPath = `t_usuarios/${user.uid}`; // Construye la ruta del usuario en Firebase
  
          path = `t_diagnosticos/${user.uid}/t_diagnosticos`;// Construye la ruta de los diagnósticos del usuario

          this.loading = true; // Establece loading en true para mostrar el indicador de carga
  
          let sub = this.firebaseService.getCollectionDataDiagnosticos(path) // Obtiene los diagnósticos del usuario
          .snapshotChanges().pipe(
            map(changes => changes.map( c => ({ // Mapea los cambios para obtener los datos de los documentos
              id: c.payload.doc.id, // Obtiene el id del documento
              ...c.payload.doc.data() // Obtiene los datos del documento
            })))
          ).subscribe({
            next: (resp: any) => { // En caso de éxito
              this.diagnostico = resp; // Asigna los diagnósticos obtenidos a la propiedad diagnostico
              this.loading = false; // Establece loading en false para ocultar el indicador de carga
              sub.unsubscribe(); // Cancela la suscripción para evitar fugas de memoria
            }
          })
          this.firebaseService.getDocument(userPath).then(userData => { // Obtiene datos adicionales del usuario si es necesario
          }).catch(error => { // En caso de error al obtener datos del usuario
            console.error('Error obteniendo datos de usuario:', error); // Muestra el error en consola
          });
        }
      });
    }

      // Método para refrescar la pantalla
  doRefresh(event : any){

    setTimeout(() => { // Establece un temporizador para simular una carga
      this.getDiagnosticos(); // Llama al método getDiagnosticos para actualizar los datos
      event.target.complete(); // Completa el evento de refresco
    }, 1000) // Establece el temporizador a 1000 milisegundos (1 segundo)
  }
}