import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-incidencias-terminadas',
  templateUrl: './incidencias-terminadas.page.html',
  styleUrls: ['./incidencias-terminadas.page.scss'],
})
export class IncidenciasTerminadasPage implements OnInit, OnDestroy {

  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  alertController = inject(AlertController);

  loading: boolean = false;
  incidencia: Incidencia[] = [];
  idUsuarios: any;
  asignaciones: Asignaciones[] = [];
  private destroy$ = new Subject<void>();  // Subject para gestionar la desuscripción

  ngOnInit() {
    this.getIncidencias();
  }

  ionViewWillEnter() {
    this.getIncidencias();
  }

  ngOnDestroy() {
    this.destroy$.next();   // Emitimos un valor para desuscribirnos de las subscripciones
    this.destroy$.complete(); // Completamos el Subject
  }

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

  doRefresh(event: any) {
    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000);
  }

  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarios();
    this.incidencia = [];

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allIncidencias = [];
        let processedUsers = 0;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`;

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
                allIncidencias = [...allIncidencias, ...resp];
                processedUsers++;

                if (processedUsers === this.idUsuarios.length) {
                  this.incidencia = allIncidencias.filter(incidencia => incidencia.cn_id_estado === 4);
                  this.loading = false;
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;

                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
                }
              }
            });

          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
              // Manejar otros datos del usuario aquí si es necesario
            })
            .catch((error) => {
              console.error('Error obteniendo datos de usuario:', error);
            });
        }
      }
    });
  }

  async fianlizarIncidencia(incidencia: Incidencia) {
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
            await this.firebaseService.actualizaTabla('/t_incidencias/',incidencia['id'], String(incidencia.cn_id_usuario), { cn_id_estado: 5 });
            await this.firebaseService.bitacoraGeneral('Incidencias terminadas',incidencia,String(this.user().cn_id_usuario), 'Finaliza la incidencia');
            await this.firebaseService.bitacoraCambioEstado(incidencia, String(this.user().cn_id_usuario), 5, 4);
         
            this.utilService.presentToast({
              message: "La incidencia ha sido finalizada exitosamente",
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

  async rechazarIncidencia(incidencia: Incidencia) {
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
            await this.firebaseService.actualizaTabla('/t_incidencias/',incidencia['id'], String(incidencia.cn_id_usuario), { cn_id_estado: 8 });
            await this.firebaseService.bitacoraGeneral('Incidencias terminadas',incidencia,String(this.user().cn_id_usuario), 'Rechaza la incidencia');
            await this.firebaseService.bitacoraCambioEstado(incidencia, String(this.user().cn_id_usuario), 8, 4);
         
            this.getIncidenciasAsignadas(incidencia);
            this.utilService.presentToast({
              message: "La incidencia ha sido rechazada exitosamente",
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

  async getIncidenciasAsignadas(incidencia: Incidencia) {
    this.idUsuarios = await this.getIdUsuarios();
    this.asignaciones = [];

    this.incidencia = [];

    this.firebaseService.getCurrentUser().subscribe((user) => {
      if (user) {
        let allAsignacion = [];
        let allA = [];
        let processedUsers = 0;
        this.loading = true;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          const path = `t_asignacion_incidencia/${this.idUsuarios[i].cn_id_usuario}/t_asignacion_incidencia`;

          this.loading = true;

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
              next: async (resp: any) => {
                allA = [...allA, ...resp];
                processedUsers++;

                if (processedUsers === this.idUsuarios.length) {
                  this.asignaciones = allA;

                  for (let i = 0; i < this.asignaciones.length; i++) {
                    if (this.asignaciones[i].cn_id_incidencia === incidencia['id'] &&
                      this.asignaciones[i].cn_id_usuario === String(incidencia.cn_id_usuario)) {
                      await this.firebaseService.eliminaRegistro(this.asignaciones[i]['id'], String(incidencia.cn_id_usuario));
                    }
                  }
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
          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
              // Manejar otros datos del usuario aquí si es necesario
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
