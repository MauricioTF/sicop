// Importa el decorador Component y las interfaces OnInit y OnDestroy de Angular Core para la gestión del ciclo de vida del componente
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// Importa Subject de la librería RxJS para la creación de observables
import { Subject } from 'rxjs';
// Importa operadores takeUntil y map de RxJS para controlar la suscripción a observables y transformar los datos recibidos
import { takeUntil, map } from 'rxjs/operators';
// Importa el modelo Asignaciones desde la carpeta de modelos
import { Asignaciones } from 'src/app/models/asignaciones.model';
// Importa el modelo Incidencia desde la carpeta de modelos
import { Incidencia } from 'src/app/models/incidencia.model';
// Importa FirebaseService desde la carpeta de servicios
import { FirebaseService } from 'src/app/services/firebase.service';
// Importa UtilsService desde la carpeta de servicios
import { UtilsService } from 'src/app/services/utils.service';
// Importa AsignarIncidenciaComponent desde la carpeta de componentes compartidos
import { AsignarIncidenciaComponent } from 'src/app/shared/components/asignar-incidencia/asignar-incidencia.component';
// Importa IncidenciasReportadasCompletaComponent desde la carpeta de información completa de incidencias reportadas
import { IncidenciasReportadasCompletaComponent } from 'src/app/shared/info-completa/incidencias-reportadas-completa/incidencias-reportadas-completa.component';

// Decorador que define el componente, su selector, la ruta del archivo de plantilla y la ruta del archivo de estilos
@Component({
  selector: 'app-incidencias-reportadas', // Selector del componente
  templateUrl: './incidencias-reportadas.page.html', // Ruta del archivo de plantilla
  styleUrls: ['./incidencias-reportadas.page.scss'], // Ruta del archivo de estilos
})
// Clase del componente que implementa las interfaces OnInit y OnDestroy para la gestión del ciclo de vida
export class IncidenciasReportadasPage implements OnInit, OnDestroy {
  utilService = inject(UtilsService); // Inyecta el servicio UtilsService
  firebaseService = inject(FirebaseService); // Inyecta el servicio FirebaseService
  loading: boolean = false; // Variable para controlar la visualización del indicador de carga
  incidencia: Incidencia[] = []; // Array para almacenar las incidencias
  idUsuarios: any; // Variable para almacenar los IDs de los usuarios
  private destroy$ = new Subject<void>();  // Subject para gestionar la desuscripción de observables

  filteredIncidencias: Incidencia[] = []; // Array para almacenar las incidencias filtradas
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    this.getIncidencias();  // Llama al método para obtener las incidencias
  }

  // Método que se ejecuta cuando la vista está a punto de entrar
  ionViewWillEnter() {
    this.getIncidencias();  // Llama al método para obtener las incidencias
  }

  // Método que se ejecuta cuando el componente se destruye
  ngOnDestroy() {
    this.destroy$.next();   // Emite un valor para desuscribirse de las subscripciones
    this.destroy$.complete(); // Completa el Subject
  }

  // Método para obtener los usuarios del servicio Firebase
  getIdUsuarios(): Promise<any> {
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

  // Método para refrescar la lista de incidencias
  doRefresh(event: any) {
    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000);
  }

  // Método para obtener las incidencias reportadas
  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarios();
    this.incidencia = []; // Limpia la lista de incidencias antes de actualizar

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allIncidencias = []; // Lista para acumular todas las incidencias
        let processedUsers = 0; // Contador para usuarios procesados

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`; // Ruta del usuario
          const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`; // Ruta de la incidencia

          this.loading = true;

          this.firebaseService
            .getCollectionDataIncidencia(path)
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
                allIncidencias = [...allIncidencias, ...resp]; // Agrega incidencias a la lista acumulada
                processedUsers++;

                // Verifica si todos los usuarios han sido procesados
                if (processedUsers === this.idUsuarios.length) {
                  // Filtra las incidencias que no estén terminadas (estado != 5)
                  this.incidencia = allIncidencias.filter(incidencia => incidencia.cn_id_estado !== 5);
                  this.filteredIncidencias = this.incidencia; // Muestra todas las incidencias inicialmente

                  this.loading = false;
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;

                // Maneja el estado de carga en caso de errores
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
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

  // Método para asignar una incidencia
  async asignarIncidencia(asignaciones?: Asignaciones, incidencia?: Incidencia) {
    let modal = await this.utilService.getModal({
      component: AsignarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: { asignaciones, incidencia },
    });

    if (modal) {
      this.getIncidencias(); // Actualiza la lista de incidencias al cerrar el modal
    }
  }

    // Método para mostrar toda la información de una incidencia
    async infoCompleta(incidencia?: Incidencia) {
      let modal = await this.utilService.getModal({
        component: IncidenciasReportadasCompletaComponent,
        cssClass: 'add-update-modal',
        componentProps: {incidencia}
      });
  
      if (modal) {
        this.getIncidencias(); // Actualiza la lista de incidencias al cerrar el modal
      }
    }

   // Método para filtrar incidencias
   filterIncidencias() {
    if (this.searchTerm === '') {
      this.filteredIncidencias = this.incidencia; // Muestra todas las incidencias si el término de búsqueda está vacío
    } else {
      this.filteredIncidencias = this.incidencia.filter(incidencia =>
        incidencia.ct_titulo.toLowerCase().includes(this.searchTerm.toLowerCase())
        || incidencia.ct_lugar.toLowerCase().includes(this.searchTerm.toLowerCase())
        || incidencia.ct_descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
        || incidencia.cf_fecha_hora.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}