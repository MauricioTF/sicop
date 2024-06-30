// Importa el decorador Component y las interfaces OnInit y OnDestroy de Angular Core para el manejo del ciclo de vida del componente.
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// Importa AlertController de Ionic Angular para mostrar alertas.
import { AlertController } from '@ionic/angular';
// Importa Subject de RxJS para crear un observable personalizado que pueda ser completado.
import { Subject } from 'rxjs';
// Importa operadores takeUntil y map de RxJS para controlar la suscripción y transformar los datos de los observables.
import { takeUntil, map } from 'rxjs/operators';
// Importa el modelo Asignaciones desde la carpeta de modelos.
import { Asignaciones } from 'src/app/models/asignaciones.model';
// Importa el modelo Incidencia desde la carpeta de modelos.
import { Incidencia } from 'src/app/models/incidencia.model';
// Importa el modelo User desde la carpeta de modelos.
import { User } from 'src/app/models/user.model';
// Importa FirebaseService desde la carpeta de servicios para interactuar con Firebase.
import { FirebaseService } from 'src/app/services/firebase.service';
// Importa UtilsService desde la carpeta de servicios para utilizar utilidades generales.
import { UtilsService } from 'src/app/services/utils.service';

// Decorador Component que define el selector, la ruta del archivo HTML y la ruta del archivo de estilos para este componente.
@Component({
  selector: 'app-incidencias-terminadas',
  templateUrl: './incidencias-terminadas.page.html',
  styleUrls: ['./incidencias-terminadas.page.scss'],
})
// Clase IncidenciasTerminadasPage que implementa las interfaces OnInit y OnDestroy para manejar el ciclo de vida del componente.
export class IncidenciasTerminadasPage implements OnInit, OnDestroy {

  // Inyecta el servicio UtilsService usando la función inject de Angular.
  utilService = inject(UtilsService);
  // Inyecta el servicio FirebaseService usando la función inject de Angular.
  firebaseService = inject(FirebaseService);
  // Inyecta el servicio AlertController usando la función inject de Angular.
  alertController = inject(AlertController);

  // Define una variable loading de tipo booleano para controlar la visualización de un indicador de carga.
  loading: boolean = false;
  // Define un arreglo incidencia de tipo Incidencia para almacenar las incidencias obtenidas.
  incidencia: Incidencia[] = [];
  // Define una variable idUsuarios para almacenar los identificadores de los usuarios.
  idUsuarios: any;
  // Define un arreglo asignaciones de tipo Asignaciones para almacenar las asignaciones obtenidas.
  asignaciones: Asignaciones[] = [];
  // Define una variable privada destroy$ de tipo Subject<void> para manejar la desuscripción de observables.
  private destroy$ = new Subject<void>();

  // Método ngOnInit que se ejecuta al inicializar el componente.
  ngOnInit() {
    // Llama al método getIncidencias al inicializar el componente.
    this.getIncidencias();
  }

  // Método ionViewWillEnter que se ejecuta cada vez que se va a entrar a la vista del componente.
  ionViewWillEnter() {
    // Llama al método getIncidencias cada vez que se va a entrar a la vista.
    this.getIncidencias();
  }

  // Método ngOnDestroy que se ejecuta al destruir el componente.
  ngOnDestroy() {
    // Emite un valor para indicar que se debe desuscribir de los observables.
    this.destroy$.next();
    // Completa el observable destroy$ para que no acepte más valores.
    this.destroy$.complete();
  }

  // Método asíncrono getIdUsuarios que devuelve una promesa con los identificadores de los usuarios.
  async getIdUsuarios(): Promise<any> {
    // Retorna una nueva promesa.
    return new Promise((resolve, reject) => {
      // Llama al método getTecnicos del servicio FirebaseService y se suscribe hasta que destroy$ emita un valor.
      this.firebaseService.getTecnicos().pipe(takeUntil(this.destroy$)).subscribe(
        (data) => {
          // Al recibir los datos, los asigna a la variable usuarios y resuelve la promesa con estos datos.
          const usuarios = data;
          resolve(usuarios);
        },
        (error) => {
          // En caso de error, imprime el error en consola y rechaza la promesa con el error.
          console.error('Error al obtener roles:', error);
          reject(error);
        }
      );
    });
  }

  // Método doRefresh que se ejecuta al realizar la acción de refrescar en la interfaz.
  doRefresh(event: any) {
    // Establece un temporizador para simular la carga de datos.
    setTimeout(() => {
      // Llama al método getIncidencias para obtener las incidencias nuevamente.
      this.getIncidencias();
      // Completa la acción de refresco en la interfaz.
      event.target.complete();
    }, 1000);
  }

  // Método asíncrono getIncidencias para obtener las incidencias.
  async getIncidencias() {
    // Espera a obtener los identificadores de los usuarios mediante el método getIdUsuarios.
    this.idUsuarios = await this.getIdUsuarios();
    // Reinicia el arreglo de incidencias.
    this.incidencia = [];

    // Se suscribe al observable que devuelve el método getCurrentUser del servicio FirebaseService.
    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      // Verifica si existe un usuario.
      if (user) {
        // Define un arreglo temporal allIncidencias para almacenar todas las incidencias.
        let allIncidencias = [];
        // Define una variable processedUsers para llevar la cuenta de los usuarios procesados.
        let processedUsers = 0;

        // Itera sobre el arreglo de identificadores de usuarios.
        for (let i = 0; i < this.idUsuarios.length; i++) {
          // Construye la ruta del documento del usuario en Firebase.
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          // Construye la ruta de la colección de incidencias en Firebase.
          const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`;

          // Establece la variable loading en true para mostrar el indicador de carga.
          this.loading = true;

          // Llama al método getCollectionDataIncidencia del servicio FirebaseService para obtener las incidencias.
          this.firebaseService
            .getCollectionDataIncidencia(path)
            .snapshotChanges()
            .pipe(
              // Transforma los cambios recibidos en un arreglo de incidencias.
              map((changes) =>
                changes.map((c) => ({
                  id: c.payload.doc.id,
                  ...c.payload.doc.data(),
                }))
              ),
              // Se suscribe hasta que destroy$ emita un valor.
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: (resp: any) => {
                // Concatena las incidencias recibidas al arreglo allIncidencias.
                allIncidencias = [...allIncidencias, ...resp];
                // Incrementa el contador de usuarios procesados.
                processedUsers++;

                // Verifica si se han procesado todos los usuarios.
                if (processedUsers === this.idUsuarios.length) {
                  // Filtra las incidencias con estado 4 y las asigna al arreglo incidencia.
                  this.incidencia = allIncidencias.filter(incidencia => incidencia.cn_id_estado === 4);
                  // Establece la variable loading en false para ocultar el indicador de carga.
                  this.loading = false;
                }
              },
              error: (error) => {
                // En caso de error, imprime el error en consola.
                console.error('Error obteniendo incidencias:', error);
                // Incrementa el contador de usuarios procesados.
                processedUsers++;

                // Verifica si se han procesado todos los usuarios.
                if (processedUsers === this.idUsuarios.length) {
                  // Establece la variable loading en false para ocultar el indicador de carga.
                  this.loading = false;
                }
              }
            });

          // Llama al método getDocument del servicio FirebaseService para obtener datos adicionales del usuario si es necesario.
          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
              // Manejar otros datos del usuario aquí si es necesario.
            })
            .catch((error) => {
              // En caso de error al obtener datos del usuario, imprime el error en consola.
              console.error('Error obteniendo datos de usuario:', error);
            });
        }
      }
    });
  }

  // Método asíncrono fianlizarIncidencia para finalizar una incidencia.
  async fianlizarIncidencia(incidencia: Incidencia) {
    // Crea una alerta para confirmar la finalización de la incidencia.
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea finalizar la incidencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Aceptar',
          handler: async () => {
            // Actualiza el estado de la incidencia a 5 (finalizada) en Firebase.
            await this.firebaseService.actualizaTabla('/t_incidencias/',incidencia['id'], String(incidencia.cn_id_usuario), { cn_id_estado: 5 });
            // Registra la acción en la bitácora general.
            await this.firebaseService.bitacoraGeneral('Incidencias terminadas',incidencia,String(this.user().cn_id_usuario), 'Finaliza la incidencia');
            // Registra el cambio de estado en la bitácora de cambio de estado.
            await this.firebaseService.bitacoraCambioEstado(incidencia, String(this.user().cn_id_usuario), 5, 4);
         
            // Muestra un mensaje de éxito usando el servicio UtilsService.
            this.utilService.presentToast({
              message: "La incidencia ha sido finalizada exitosamente",
              duration: 2500,
              color: 'success',
              position: 'bottom',
              icon: 'checkmark-circle-outline'
            });
            // Actualiza la lista de incidencias.
            this.getIncidencias();
          }
        }
      ]
    });

    // Muestra la alerta.
    await alert.present();
  }

  // Método asíncrono rechazarIncidencia para rechazar una incidencia.
  async rechazarIncidencia(incidencia: Incidencia) {
    // Crea una alerta para confirmar el rechazo de la incidencia.
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea rechazar la incidencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Aceptar',
          handler: async () => {
            // Actualiza el estado de la incidencia a 8 (rechazada) en Firebase.
            await this.firebaseService.actualizaTabla('/t_incidencias/',incidencia['id'], String(incidencia.cn_id_usuario), { cn_id_estado: 8 });
            // Resta un técnico a las asignaciones de la incidencia en Firebase.
            this.firebaseService.actualizaTabla('/t_incidencias/', incidencia['id'], String(incidencia.cn_id_usuario), { cn_tecnicos: incidencia.cn_tecnicos-1 });
            // Registra la acción en la bitácora general.
            await this.firebaseService.bitacoraGeneral('Incidencias terminadas',incidencia,String(this.user().cn_id_usuario), 'Rechaza la incidencia');
            // Registra el cambio de estado en la bitácora de cambio de estado.
            await this.firebaseService.bitacoraCambioEstado(incidencia, String(this.user().cn_id_usuario), 8, 4);
         
            // Llama al método getIncidenciasAsignadas para actualizar las asignaciones.
            this.getIncidenciasAsignadas(incidencia);
            // Muestra un mensaje de éxito al usuario utilizando el servicio utilService
            this.utilService.presentToast({
              message: "La incidencia ha sido rechazada exitosamente",
              duration: 2500,
              color: 'success',
              position: 'bottom',
              icon: 'checkmark-circle-outline'
            });
            this.getIncidencias();// Llama al método para obtener las incidencias nuevamente
          }
        }
      ]
    });

    await alert.present();
  }

  // Método asíncrono para obtener las incidencias asignadas a un usuario
  async getIncidenciasAsignadas(incidencia: Incidencia) {
    this.idUsuarios = await this.getIdUsuarios();// Obtiene los IDs de los usuarios
    this.asignaciones = [];

    this.incidencia = [];

      // Obtiene el usuario actual desde el servicio firebaseService
    this.firebaseService.getCurrentUser().subscribe((user) => {
      if (user) {// Si hay un usuario logueado
        let allA = []; // Arreglo para almacenar todas las asignaciones
        let processedUsers = 0;
        this.loading = true;// Indica que se está cargando la información

              // Itera sobre el arreglo de IDs de usuarios
        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          const path = `t_asignacion_incidencia/${this.idUsuarios[i].cn_id_usuario}/t_asignacion_incidencia`;

          this.loading = true;

        // Obtiene los datos de las incidencias asignadas desde Firebase
          this.firebaseService
            .getCollectionDataIncidenciasAsignadas(path)
            .snapshotChanges()
            .pipe(
              map((changes) =>
                changes.map((c) => ({
                  id: c.payload.doc.id,
                  ...c.payload.doc.data(),
                }))
              ),
              takeUntil(this.destroy$)// Se desuscribe automáticamente usando takeUntil
            )
            .subscribe({
              next: async (resp: any) => {
                allA = [...allA, ...resp];// Agrega las respuestas al arreglo allA
                processedUsers++;
                
              // Si se han procesado todos los usuarios
                if (processedUsers === this.idUsuarios.length) {
                  this.asignaciones = allA;

                  // Itera sobre el arreglo de asignaciones
                  for (let i = 0; i < this.asignaciones.length; i++) {
                    // Si la asignación corresponde a la incidencia y usuario actual
                    if (this.asignaciones[i].cn_id_incidencia === incidencia['id'] &&
                      this.asignaciones[i].cn_id_usuario === String(incidencia.cn_id_usuario)) {
                      // Elimina el registro de la asignación
                      await this.firebaseService.eliminaRegistro(this.asignaciones[i]['id'], String(incidencia.cn_id_usuario));
                    }
                  }
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;

              // Si se han procesado todos los usuarios               
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
                }
              },
            });
          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
            })
            .catch((error) => {
              console.error('Error obteniendo datos de usuario:', error);
            });
        }
      }
    });
  }

    // Método para obtener los datos del usuario del almacenamiento local
    user(): User {
      return this.utilService.getLocalStorage('user');
    }
}
