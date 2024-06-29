import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AsignarIncidenciaComponent } from 'src/app/shared/components/asignar-incidencia/asignar-incidencia.component';
import { IncidenciasReportadasCompletaComponent } from 'src/app/shared/info-completa/incidencias-reportadas-completa/incidencias-reportadas-completa.component';

@Component({
  selector: 'app-incidencias-reportadas',
  templateUrl: './incidencias-reportadas.page.html',
  styleUrls: ['./incidencias-reportadas.page.scss'],
})
export class IncidenciasReportadasPage implements OnInit, OnDestroy {
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  incidencia: Incidencia[] = [];
  idUsuarios: any;
  private destroy$ = new Subject<void>();  // Subject para gestionar la desuscripción

  filteredIncidencias: Incidencia[] = []; // Incidencias filtradas
  searchTerm: string = ''; // Término de búsqueda

  ngOnInit() {
    this.getIncidencias();  // Llamamos al método para obtener incidencias al inicializar el componente
  }

  ionViewWillEnter() {
    this.getIncidencias();  // Llamamos al método para obtener incidencias cuando la vista está a punto de entrar
  }

  // Método que se ejecuta cuando el componente se destruye
  ngOnDestroy() {
    this.destroy$.next();   // Emitimos un valor para desuscribirnos de las subscripciones
    this.destroy$.complete(); // Completamos el Subject
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
    this.incidencia = []; // Limpiamos la lista de incidencias antes de actualizar

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
                allIncidencias = [...allIncidencias, ...resp]; // Agregamos incidencias a la lista acumulada
                processedUsers++;

                // Verificamos si todos los usuarios han sido procesados
                if (processedUsers === this.idUsuarios.length) {
                  // Filtramos las incidencias que no estén terminadas (estado != 5)
                  this.incidencia = allIncidencias.filter(incidencia => incidencia.cn_id_estado !== 5);
                  this.filteredIncidencias = this.incidencia; // Mostrar todas las incidencias inicialmente

                  this.loading = false;
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;

                // Manejamos el estado de carga en caso de errores
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
                }
              }
            });

          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
              // Manejamos otros datos del usuario aquí si es necesario
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
      this.getIncidencias(); // Actualizamos la lista de incidencias al cerrar el modal
    }
  }

    // Método para mostrar incidencia completa toda la info
    async infoCompleta(incidencia?: Incidencia) {
      let modal = await this.utilService.getModal({
        component: IncidenciasReportadasCompletaComponent,
        cssClass: 'add-update-modal',
        componentProps: {incidencia}
      });
  
      if (modal) {
        this.getIncidencias(); // Actualizamos la lista de incidencias al cerrar el modal
      }
    }

   // Método para filtrar incidencias
   filterIncidencias() {
    if (this.searchTerm === '') {
      this.filteredIncidencias = this.incidencia; // Mostrar todas las incidencias si el término de búsqueda está vacío
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
