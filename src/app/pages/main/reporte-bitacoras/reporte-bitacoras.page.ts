// Importa los módulos necesarios de Angular, RxJS y los servicios y modelos propios de la aplicación.
import { Component, OnInit, inject } from '@angular/core'; // Importa Component, OnInit para el ciclo de vida del componente, e inject para inyección de dependencias.
import { Subject, map, takeUntil } from 'rxjs'; // Importa Subject para crear un observable personalizado, map y takeUntil de RxJS para manipulación de observables.
import { bitacoraCambioEstado } from 'src/app/models/bitacoraCambioEstado.model'; // Importa el modelo bitacoraCambioEstado.
import { bitacoraGeneral } from 'src/app/models/bitacoraGeneral.model'; // Importa el modelo bitacoraGeneral.
import { FirebaseService } from 'src/app/services/firebase.service'; // Importa el servicio FirebaseService para interactuar con Firebase.
import { UtilsService } from 'src/app/services/utils.service'; // Importa el servicio UtilsService para utilizar utilidades generales.

// Decorador que define el componente, su selector, la ruta de su archivo HTML y su archivo de estilos.
@Component({
  selector: 'app-reporte-bitacoras', // Selector CSS para utilizar el componente.
  templateUrl: './reporte-bitacoras.page.html', // Ruta del archivo HTML del componente.
  styleUrls: ['./reporte-bitacoras.page.scss'], // Ruta del archivo de estilos del componente.
})
// Clase del componente que implementa OnInit para el manejo del ciclo de vida del componente.
export class ReporteBitacorasPage implements OnInit {

  // Inyección de dependencias de los servicios utilizados.
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  // Declaración de variables para controlar el estado de carga y almacenar los datos de las bitácoras.
  loading: boolean = false; // Controla la visualización de un indicador de carga.
  bitacoraCE: bitacoraCambioEstado[] = []; // Almacena los datos de las bitácoras de cambio de estado.
  bitacoraG: bitacoraGeneral[] = []; // Almacena los datos de las bitácoras generales.

  // Subject para gestionar la desuscripción de observables.
  private destroy$ = new Subject<void>();
  // Variables para almacenar los usuarios y la opción seleccionada.
  idUsuarios: any;
  selectedOption: string = '';

  // Método vacío ngOnInit que se ejecuta al inicializar el componente.
  ngOnInit() {
  }

  // Método que se ejecuta cuando la vista está a punto de entrar y se encarga de obtener los datos de las bitácoras.
  ionViewWillEnter() {
    this.getBitacoraCambioEstado();
    this.getBitacoraGeneral();
  }

  // Método para limpiar los observables al destruir el componente.
  ngOnDestroy() {
    this.destroy$.next(); // Emite un valor para indicar la desuscripción.
    this.destroy$.complete(); // Completa el Subject.
  }

  // Método asíncrono para obtener los IDs de los usuarios, retorna una promesa.
  async getIdUsuarios(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getTecnicos().pipe(takeUntil(this.destroy$)).subscribe(
        (data) => {
          const usuarios = data;
          resolve(usuarios);
        },
        (error) => {
          console.error('Error al obtener roles:', error);
          reject(error);
        }
      );
    });
  }

  // Método para refrescar los datos de las bitácoras.
  doRefresh(event: any) {
    setTimeout(() => {
      this.getBitacoraCambioEstado();
      this.getBitacoraGeneral();
      event.target.complete();
    }, 1000);
  }

  // Método asíncrono para obtener los datos de la bitácora de cambio de estado.
  async getBitacoraCambioEstado() {
    this.idUsuarios = await this.getIdUsuarios(); // Obtiene los IDs de los usuarios.
    this.bitacoraCE = []; // Reinicia el array de bitácoras de cambio de estado.

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allData = [];
        let processedUsers = 0;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          const path = `t_bitacora_cambio_estado/${this.idUsuarios[i].cn_id_usuario}/t_bitacora_cambio_estado`;

          this.loading = true; // Activa el indicador de carga.

          this.firebaseService
            .getCollectionDataBitacoraCE(path)
            .snapshotChanges()
            .pipe(
              map((changes) =>
                changes.map((c) => ({
                  id: c.payload.doc.id,
                  ...c.payload.doc.data(),
                }))
              ),
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: (resp: any) => {
                allData = [...allData, ...resp];
                processedUsers++;

                for (let j = 0; j < allData.length; j++) {
                  if(allData[j].cn_id_usuario == this.idUsuarios[i].cn_id_usuario){
                    allData[j].cn_id_usuario = this.idUsuarios[i].ct_nombre;
                    this.bitacoraCE = allData;
                  }
                }

                this.loading = false; // Desactiva el indicador de carga.

              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false; // Desactiva el indicador de carga si se han procesado todos los usuarios.
                }
              }
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

  // Método asíncrono para obtener los datos de la bitácora general.
  async getBitacoraGeneral() {
    this.idUsuarios = await this.getIdUsuarios(); // Obtiene los IDs de los usuarios.
    this.bitacoraG = []; // Reinicia el array de bitácoras generales.

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allData = [];
        let processedUsers = 0;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          const path = `t_bitacora_general/${this.idUsuarios[i].cn_id_usuario}/t_bitacora_general`;

          this.loading = true; // Activa el indicador de carga.

          this.firebaseService
            .getCollectionDataBitacoraG(path)
            .snapshotChanges()
            .pipe(
              map((changes) =>
                changes.map((c) => ({
                  id: c.payload.doc.id,
                  ...c.payload.doc.data(),
                }))
              ),
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: (resp: any) => {
                allData = [...allData, ...resp];
                processedUsers++;

                for (let j = 0; j < allData.length; j++) {
                  if(allData[j].cn_id_usuario == this.idUsuarios[i].cn_id_usuario){
                    allData[j].cn_id_usuario = this.idUsuarios[i].ct_nombre;
                    this.bitacoraG = allData;
                  }
                }

                this.loading = false; // Desactiva el indicador de carga.

                console.log('bitacora general :', this.bitacoraG);
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false; // Desactiva el indicador de carga si se han procesado todos los usuarios.
                }
              }
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
}