// Importación de módulos y servicios necesarios
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // Importa Component, OnInit para el ciclo de vida del componente, inject para inyección de dependencias y ChangeDetectorRef para la detección de cambios.
import { UtilsService } from 'src/app/services/utils.service'; // Importa UtilsService para utilizar sus métodos.
import { ActualizarIncidenciaComponent } from 'src/app/shared/components/actualizar-incidencia/actualizar-incidencia.component'; // Importa ActualizarIncidenciaComponent para su uso en modales.
import { FirebaseService } from 'src/app/services/firebase.service'; // Importa FirebaseService para interactuar con Firebase.
import { User } from 'src/app/models/user.model'; // Importa el modelo User.
import { Incidencia } from 'src/app/models/incidencia.model'; // Importa el modelo Incidencia.
import { map } from 'rxjs'; // Importa map de rxjs para transformar los valores emitidos por los observables.

// Decorador de Componente que define metadatos para el componente
@Component({
  selector: 'app-home', // Selector CSS para usar el componente.
  templateUrl: './home.page.html', // Ruta al archivo de plantilla del componente.
  styleUrls: ['./home.page.scss'], // Ruta a los estilos específicos del componente.
})
export class HomePage implements OnInit { // Define la clase HomePage que implementa OnInit para el manejo del ciclo de vida del componente.

  // Inyección de servicios y definición de variables
  utilService = inject(UtilsService); // Inyecta UtilsService.
  firebaseService = inject(FirebaseService); // Inyecta FirebaseService.
  userId: string | null = null; // Define userId para almacenar el ID del usuario actual, inicialmente nulo.

  loading: boolean = false; // Define loading para controlar la visualización de indicadores de carga.
  incidencia: Incidencia[] = []; // Define incidencia para almacenar un arreglo de incidencias.

  specificRole: any; // Define specificRole para almacenar el rol específico del usuario.
  
  tecnico: boolean = false; // Define tecnico para indicar si el usuario es técnico.
  usuario: boolean = false; // Define usuario para indicar si el usuario es un usuario regular.
  encargado: boolean = false; // Define encargado para indicar si el usuario es un encargado.

  rolesArray: number[] = []; // Define rolesArray para almacenar los IDs de roles del usuario.
  cdr = inject(ChangeDetectorRef); // Inyecta ChangeDetectorRef para la detección de cambios.

  // Método que se ejecuta al inicializar el componente
  async ngOnInit() {
    this.specificRole = await this.firebaseService.getSpecificRole(String(this.user().cn_id_usuario)); // Obtiene el rol específico del usuario y lo almacena en specificRole.

    for (let i = 0; i < this.specificRole.length; i++) { // Itera sobre specificRole.
      this.rolesArray.push(this.specificRole[i].cn_id_rol); // Añade el ID del rol al arreglo rolesArray.
    }

    this.tecnico = this.rolesArray.includes(4); // Establece tecnico como verdadero si el arreglo contiene el ID 4.
    this.usuario = this.rolesArray.includes(2); // Establece usuario como verdadero si el arreglo contiene el ID 2.
    this.encargado = this.rolesArray.includes(3); // Establece encargado como verdadero si el arreglo contiene el ID 3.

    this.cdr.detectChanges(); // Forza la detección de cambios en el componente.
  }

  // Método que se ejecuta cuando la vista está a punto de entrar y volverse la vista activa
  ionViewWillEnter() {
    this.getIncidencias(); // Llama a getIncidencias para obtener las incidencias.
  }

  // Método para agregar un incidente
  async addUpdateIncident(incidencia?: Incidencia) {
    let modal = await this.utilService.getModal({ // Obtiene un modal para agregar o actualizar una incidencia.
      component: ActualizarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: { incidencia }
    });
    
    await this.firebaseService.bitacoraGeneral('Mis incidencias', incidencia, this.userId, 'Registro de incidencia'); // Registra la incidencia en la bitácora general.

    if (modal) this.getIncidencias(); // Si el modal se cerró correctamente, actualiza la lista de incidencias.
  }

  // Método para obtener los datos del usuario del almacenamiento local
  user(): User {
    return this.utilService.getLocalStorage('user'); // Retorna los datos del usuario almacenados localmente.
  }

  // Método para obtener la lista de incidencias reportadas
  getIncidencias() {
    let path;
    this.firebaseService.getCurrentUser().subscribe(user => { // Obtiene el usuario actual de Firebase.
      if (user) {
        this.userId = user.uid; // Almacena el ID del usuario.
        const userPath = `t_usuarios/${this.userId}`; // Define el path del usuario.

        path = `t_incidencias/${this.userId}/t_incidencias`; // Define el path de las incidencias del usuario.
        
        this.loading = true; // Activa el indicador de carga.

        let sub = this.firebaseService.getCollectionDataIncidencia(path)
          .snapshotChanges().pipe(
            map(changes => changes.map(c => ({ // Mapea los cambios para obtener los datos de las incidencias.
              id: c.payload.doc.id,
              ...c.payload.doc.data()
            })))
          ).subscribe({
            next: (resp: any) => {
              this.incidencia = resp; // Almacena las incidencias obtenidas.
              this.loading = false; // Desactiva el indicador de carga.
              sub.unsubscribe(); // Cancela la suscripción para evitar fugas de memoria.
            }
          });
        this.firebaseService.getDocument(userPath).then(userData => {
          // Maneja los datos adicionales del usuario si es necesario.
        }).catch(error => {
          console.error('Error obteniendo datos de usuario:', error); // Maneja errores al obtener datos del usuario.
        });
      }
    });
  }

  // Método para refrescar la pantalla
  doRefresh(event: any) {
    setTimeout(() => {
      this.getIncidencias(); // Actualiza las incidencias después de 1 segundo.
      event.target.complete(); // Completa la acción de refresco.
    }, 1000);
  }
}