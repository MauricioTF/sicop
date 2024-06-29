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

@Component({
  selector: 'app-incidencias-asignadas',
  templateUrl: './incidencias-asignadas.page.html',
  styleUrls: ['./incidencias-asignadas.page.scss'],
})
export class IncidenciasAsignadasPage implements OnInit, OnDestroy {
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  alertController = inject(AlertController);

  loading: boolean = false;
  asignaciones: Asignaciones[] = [];
  incidencia: Incidencia[] = [];
  idUsuarios: any;
  sepcificAsignation: any;
  showBtn: boolean = false;
  btnTerminaIncidencia: boolean = false;
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
      this.firebaseService
        .getTecnicos()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
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

  // Obtiene las incidencias asignadas
  async getIncidenciasAsignadas() {
    this.idUsuarios = await this.getIdUsuarios();
    this.asignaciones = [];
    this.incidencia = [];

    this.firebaseService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
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

  // Obtiene las incidencias
  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarios();
    this.incidencia = [];

    this.firebaseService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
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
                          this.asignaciones[i].cn_id_incidencia ===
                            allIncidencias[j].id &&
                            allIncidencias[j].cn_id_estado != 8 &&
                            allIncidencias[j].cn_id_estado != 5 &&
                          allIncidencias[j].cn_id_estado != 4 
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

  async terminaIncidencia(incidencia?: Incidencia){

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea terninar la incidencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Aceptar',
          handler: async () => {
           
            await this.firebaseService.bitacoraGeneral('Incidencias asignadas',incidencia, String(this.user().cn_id_usuario), 'Termina incidencia');
            await this.firebaseService.bitacoraCambioEstado(incidencia, String(this.user().cn_id_usuario), 4, 3);
            await this.firebaseService.actualizaTabla(
              '/t_incidencias/',
              incidencia['id'],
              String(incidencia['cn_id_usuario']),
              { cn_id_estado: 4 }
            );
        
            this.utilService.presentToast({
              message: "La incidencia ha sido terminada exitosamente",
              duration: 2500,
              color: 'success',
              position: 'bottom',
              icon: 'checkmark-circle-outline'
            });
            this.getIncidencias();
          }
        }
      ]
    });

    await alert.present();

  }

  // Agrega un diagnostico a la incidencia
  async addDiagnostico(diagnostico?: Diagnostico, incidencia?: Incidencia) {
    let modal = await this.utilService.getModal({
      component: DiagnosticoIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: { diagnostico, incidencia },
    });

    if (modal) this.getIncidencias();
    this.btnTerminaIncidencia = true;
  }

  // Método para mostrar incidencia completa toda la info
  async infoCompleta(incidencia?: Incidencia) {
    let modal = await this.utilService.getModal({
      component: IncidenciasReportadasCompletaComponent,
      cssClass: 'add-update-modal',
      componentProps: { incidencia },
    });

    if (modal) {
      this.getIncidencias(); // Actualizamos la lista de incidencias al cerrar el modal
    }
  }

  async setEstadoEnRevision(incidencia: Incidencia) {

    await this.firebaseService.bitacoraGeneral(
      'Incidencias asignadas',
      incidencia,
      String(this.user().cn_id_usuario),
      'Revisión de incidencia'
    );
    await this.firebaseService.actualizaTabla(
      '/t_incidencias/',
      incidencia['id'],
      String(incidencia['cn_id_usuario']),
      { cn_id_estado: 6 }
    );

    incidencia.cn_id_estado = 6;
    this.showBtn = true;
  }

  // Método para obtener los datos del usuario del almacenamiento local
  user(): User {
    return this.utilService.getLocalStorage('user');
  }
}
