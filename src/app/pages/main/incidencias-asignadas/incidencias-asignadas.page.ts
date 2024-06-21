import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Diagnostico } from 'src/app/models/diagnostico.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DiagnosticoIncidenciaComponent } from 'src/app/shared/components/diagnostico-incidencia/diagnostico-incidencia.component';
import { IncidenciasReportadasCompletaComponent } from 'src/app/shared/info-completa/incidencias-reportadas-completa/incidencias-reportadas-completa.component';

@Component({
  selector: 'app-incidencias-asignadas',
  templateUrl: './incidencias-asignadas.page.html',
  styleUrls: ['./incidencias-asignadas.page.scss'],
})
export class IncidenciasAsignadasPage implements OnInit, OnDestroy {
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  asignaciones: Asignaciones[] = [];
  incidencia: Incidencia[] = [];
  idUsuarios: any;
  sepcificAsignation: any;
  showBtn: boolean = false;
  private destroy$ = new Subject<void>();

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillEnter() {
    this.getIncidenciasAsignadas();
  }

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

  doRefresh(event: any) {
    setTimeout(() => {
      this.getIncidenciasAsignadas();
      event.target.complete();
    }, 1000);
  }

  async getIncidenciasAsignadas() {
    this.idUsuarios = await this.getIdUsuarios();
    this.asignaciones = [];
    this.incidencia = [];

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allAsignacion = [];
        let processedUsers = 0;
        this.loading = true;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const path = `t_asignacion_incidencia/${this.idUsuarios[i].cn_id_usuario}/t_asignacion_incidencia`;

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
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: (resp: any) => {
                allAsignacion = [...allAsignacion, ...resp];
                processedUsers++;
                if (processedUsers === this.idUsuarios.length) {
                  this.asignaciones = allAsignacion.filter(
                    (incidencia) => incidencia.cn_id_usuario === user.uid
                  );
                  this.getIncidencias();
                  this.loading = false;
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
                }
              },
            });
        }
      }
    });
  }

  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarios();
    this.incidencia = [];

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allIncidencias = [];
        let processedUsers = 0;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`;

          this.firebaseService
            .getCollectionDataIncidenciaByPriority(path)
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
                allIncidencias = [...allIncidencias, ...resp];
                processedUsers++;

                if (processedUsers === this.idUsuarios.length) {
                  for (let i = 0; i < this.asignaciones.length; i++) {
                    for (let j = 0; j < allIncidencias.length; j++) {
                      if (
                        this.asignaciones[i].cn_id_incidencia === allIncidencias[j].id &&
                        allIncidencias[j].cn_id_estado < 4
                      ) {
                        this.incidencia.push(allIncidencias[j]);
                      }
                    }
                  }
                  this.loading = false;
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
                }
              },
            });
        }
      }
    });
  }

  async addDiagnostico(diagnostico?: Diagnostico, incidencia?: Incidencia) {
    let modal = await this.utilService.getModal({
      component: DiagnosticoIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: { diagnostico, incidencia },
    });

    if (modal) this.getIncidencias();
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
      
  async setEstadoEnRevision(incidencia: Incidencia) {
    await this.firebaseService.actualizaTabla(incidencia['id'], String(incidencia['cn_id_usuario']), { cn_id_estado: 3 });

    incidencia.cn_id_estado = 3;
    this.showBtn = true;
  }
}
