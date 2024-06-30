// Importaciones de Angular, Ionic, RxJS, modelos y servicios necesarios para el componente
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Diagnostico } from 'src/app/models/diagnostico.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DiagnosticoIncidenciaComponent } from 'src/app/shared/components/diagnostico-incidencia/diagnostico-incidencia.component';
import { IncidenciasReportadasCompletaComponent } from 'src/app/shared/info-completa/incidencias-reportadas-completa/incidencias-reportadas-completa.component';

// Decorador que define el componente, su selector, ruta de la plantilla y estilos
@Component({
  selector: 'app-incidencias-asignadas',
  templateUrl: './incidencias-asignadas.page.html',
  styleUrls: ['./incidencias-asignadas.page.scss'],
})
// Clase del componente que implementa OnInit y OnDestroy para manejar el ciclo de vida del componente
export class IncidenciasAsignadasPage implements OnInit, OnDestroy {
  // Inyección de servicios necesarios para el componente
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  alertController = inject(AlertController);

  // Declaración de variables para manejar el estado del componente
  loading: boolean = false;
  asignaciones: Asignaciones[] = [];
  incidencia: Incidencia[] = [];
  idUsuarios: any;
  sepcificAsignation: any;
  showBtn: boolean = false;
  btnTerminaIncidencia: boolean = false;
  private destroy$ = new Subject<void>();

  // Método vacío ngOnInit, parte del ciclo de vida del componente, se ejecuta al inicializar el componente
  ngOnInit() {}

  // Método ngOnDestroy, se ejecuta al destruir el componente para liberar recursos
  ngOnDestroy() {
    this.destroy$.next(); // Emite un valor para indicar la finalización
    this.destroy$.complete(); // Completa el observable para evitar fugas de memoria
  }

  // Método que se ejecuta al entrar a la vista, llama a getIncidenciasAsignadas para cargar las incidencias
  ionViewWillEnter() {
    this.getIncidenciasAsignadas();
  }

  // Método para obtener los IDs de los usuarios, devuelve una promesa
  getIdUsuarios(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService
        .getTecnicos()
        .pipe(takeUntil(this.destroy$)) // Se asegura de cancelar la suscripción al destruir el componente
        .subscribe(
          (data) => {
            const usuarios = data;
            resolve(usuarios); // Resuelve la promesa con los datos obtenidos
          },
          (error) => {
            console.error('Error al obtener roles:', error);
            reject(error); // Rechaza la promesa en caso de error
          }
        );
    });
  }

  // Método para refrescar la lista de incidencias asignadas, se ejecuta al realizar una acción de "pull to refresh"
  doRefresh(event: any) {
    setTimeout(() => {
      this.getIncidenciasAsignadas(); // Recarga las incidencias asignadas
      event.target.complete(); // Completa la acción de refresco
    }, 1000); // Retraso de 1 segundo para simular una carga
  }

  // Método asíncrono para obtener las incidencias asignadas al usuario actual
  async getIncidenciasAsignadas() {
    this.idUsuarios = await this.getIdUsuarios(); // Obtiene los IDs de los usuarios
    this.asignaciones = []; // Reinicia el arreglo de asignaciones
    this.incidencia = []; // Reinicia el arreglo de incidencias

    this.firebaseService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$)) // Se asegura de cancelar la suscripción al destruir el componente
      .subscribe((user) => {
        if (user) { // Verifica si hay un usuario autenticado
          let allAsignacion = [];
          let processedUsers = 0;
          this.loading = true; // Activa el indicador de carga

          for (let i = 0; i < this.idUsuarios.length; i++) { // Itera sobre los IDs de los usuarios
            const path = `t_asignacion_incidencia/${this.idUsuarios[i].cn_id_usuario}/t_asignacion_incidencia`;

            this.firebaseService
              .getCollectionDataIncidenciasAsignadas(path)
              .snapshotChanges() // Obtiene los cambios en tiempo real de la colección
              .pipe(
                map((changes) =>
                  changes.map((c) => ({
                    id: c.payload.doc.id,
                    ...c.payload.doc.data(),
                  }))
                ),
                takeUntil(this.destroy$) // Se asegura de cancelar la suscripción al destruir el componente
              )
              .subscribe({
                next: (resp: any) => {
                  allAsignacion = [...allAsignacion, ...resp]; // Acumula las asignaciones obtenidas
                  processedUsers++; // Incrementa el contador de usuarios procesados
                  if (processedUsers === this.idUsuarios.length) { // Verifica si se han procesado todos los usuarios
                    this.asignaciones = allAsignacion.filter(
                      (incidencia) => incidencia.cn_id_usuario === user.uid // Filtra las asignaciones del usuario actual
                    );
                    this.getIncidencias(); // Obtiene las incidencias relacionadas a las asignaciones
                    this.loading = false; // Desactiva el indicador de carga
                  }
                },
                error: (error) => {
                  console.error('Error obteniendo incidencias:', error);
                  processedUsers++; // Incrementa el contador de usuarios procesados incluso en caso de error
                  if (processedUsers === this.idUsuarios.length) { // Verifica si se han procesado todos los usuarios
                    this.loading = false; // Desactiva el indicador de carga
                  }
                },
              });
          }
        }
      });
  }

  // Método asíncrono para obtener las incidencias relacionadas a las asignaciones del usuario actual
  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarios(); // Obtiene los IDs de los usuarios nuevamente
    this.incidencia = []; // Reinicia el arreglo de incidencias

    this.firebaseService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$)) // Se asegura de cancelar la suscripción al destruir el componente
      .subscribe((user) => {
        if (user) { // Verifica si hay un usuario autenticado
          let allIncidencias = [];
          let processedUsers = 0;

          for (let i = 0; i < this.idUsuarios.length; i++) { // Itera sobre los IDs de los usuarios
            const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`;

            this.firebaseService
              .getCollectionDataIncidenciaByPriority(path)
              .snapshotChanges() // Obtiene los cambios en tiempo real de la colección
              .pipe(
                map((changes) =>
                  changes.map((c) => ({
                    id: c.payload.doc.id,
                    ...c.payload.doc.data(),
                  }))
                ),
                takeUntil(this.destroy$) // Se asegura de cancelar la suscripción al destruir el componente
              )
              .subscribe({
                next: (resp: any) => {
                  allIncidencias = [...allIncidencias, ...resp]; // Acumula las incidencias obtenidas
                  processedUsers++; // Incrementa el contador de usuarios procesados

                  if (processedUsers === this.idUsuarios.length) { // Verifica si se han procesado todos los usuarios
                    for (let i = 0; i < this.asignaciones.length; i++) { // Itera sobre las asignaciones
                      for (let j = 0; j < allIncidencias.length; j++) { // Itera sobre las incidencias
                        if (
                          this.asignaciones[i].cn_id_incidencia ===
                            allIncidencias[j].id &&
                            allIncidencias[j].cn_id_estado != 8 &&
                            allIncidencias[j].cn_id_estado != 5 &&
                          allIncidencias[j].cn_id_estado != 4 
                        ) { // Verifica si la incidencia está relacionada a la asignación y no está en ciertos estados
                          this.incidencia.push(allIncidencias[j]); // Añade la incidencia al arreglo
                        }
                      }
                    }
                    this.loading = false; // Desactiva el indicador de carga
                  }
                },
                error: (error) => {
                  console.error('Error obteniendo incidencias:', error);
                  processedUsers++; // Incrementa el contador de usuarios procesados incluso en caso de error
                  if (processedUsers === this.idUsuarios.length) { // Verifica si se han procesado todos los usuarios
                    this.loading = false; // Desactiva el indicador de carga
                  }
                },
              });
          }
        }
      });
  }

  // Método asíncrono para terminar una incidencia, muestra un diálogo de confirmación antes de proceder
  async terminaIncidencia(incidencia?: Incidencia){

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea terninar la incidencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {} // Manejador para el botón de cancelar
        },
        {
          text: 'Aceptar',
          handler: async () => {
            // Llama a métodos del servicio para registrar la acción y actualizar el estado de la incidencia
            await this.firebaseService.bitacoraGeneral('Incidencias asignadas',incidencia, String(this.user().cn_id_usuario), 'Termina incidencia');
            await this.firebaseService.bitacoraCambioEstado(incidencia, String(this.user().cn_id_usuario), 4, 3);
            await this.firebaseService.actualizaTabla(
              '/t_incidencias/',
              incidencia['id'],
              String(incidencia['cn_id_usuario']),
              { cn_id_estado: 4 }
            );
        
            // Muestra un mensaje de confirmación
            this.utilService.presentToast({
              message: "La incidencia ha sido terminada exitosamente",
              duration: 2500,
              color: 'success',
              position: 'bottom',
              icon: 'checkmark-circle-outline'
            });
            this.getIncidencias(); // Recarga las incidencias
          }
        }
      ]
    });

    await alert.present(); // Muestra el diálogo de confirmación

  }

  // Método asíncrono para agregar un diagnóstico a una incidencia, muestra un modal para la entrada de datos
  async addDiagnostico(diagnostico?: Diagnostico, incidencia?: Incidencia) {
    let modal = await this.utilService.getModal({
      component: DiagnosticoIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: { diagnostico, incidencia },
    });

    if (modal) this.getIncidencias(); // Recarga las incidencias si se cerró el modal
    this.btnTerminaIncidencia = true; // Activa el botón para terminar la incidencia
  }

  // Método asíncrono para mostrar información completa de una incidencia, muestra un modal con los detalles
  async infoCompleta(incidencia?: Incidencia) {
    let modal = await this.utilService.getModal({
      component: IncidenciasReportadasCompletaComponent,
      cssClass: 'add-update-modal',
      componentProps: { incidencia },
    });

    if (modal) {
      this.getIncidencias(); // Recarga las incidencias al cerrar el modal
    }
  }

 // Define un método asíncrono llamado `setEstadoEnRevision` que recibe un objeto `incidencia` de tipo `Incidencia`.
async setEstadoEnRevision(incidencia: Incidencia) {

  // Llama al método `bitacoraGeneral` del servicio `firebaseService`, pasando un título, la incidencia, el ID del usuario actual convertido a cadena y una descripción de la acción.
  // Este método registra en la base de datos una entrada de bitácora para la acción realizada.
  await this.firebaseService.bitacoraGeneral(
    'Incidencias asignadas',
    incidencia,
    String(this.user().cn_id_usuario),
    'Revisión de incidencia'
  );

  // Llama al método `actualizaTabla` del servicio `firebaseService` para actualizar el estado de la incidencia en la base de datos.
  // Se especifica la ruta de la tabla de incidencias, el ID de la incidencia, el ID del usuario (convertido a cadena) y el nuevo estado de la incidencia.
  await this.firebaseService.actualizaTabla(
    '/t_incidencias/',
    incidencia['id'],
    String(incidencia['cn_id_usuario']),
    { cn_id_estado: 6 }
  );

  // Actualiza el estado de la incidencia en el objeto `incidencia` localmente a 6, reflejando el cambio en la base de datos.
  incidencia.cn_id_estado = 6;

  // Establece la variable `showBtn` a `true`, lo que podría usarse para mostrar u ocultar botones en la interfaz de usuario basándose en el nuevo estado de la incidencia.
  this.showBtn = true;
}

// Define un método llamado `user` que devuelve un objeto `User`.
// Este método obtiene los datos del usuario almacenados localmente
user(): User {
  return this.utilService.getLocalStorage('user');
}
}
