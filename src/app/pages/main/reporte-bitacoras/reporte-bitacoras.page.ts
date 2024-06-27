import { Component, OnInit, inject } from '@angular/core';
import { Subject, map, takeUntil } from 'rxjs';
import { bitacoraCambioEstado } from 'src/app/models/bitacoraCambioEstado.model';
import { bitacoraGeneral } from 'src/app/models/bitacoraGeneral.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-reporte-bitacoras',
  templateUrl: './reporte-bitacoras.page.html',
  styleUrls: ['./reporte-bitacoras.page.scss'],
})
export class ReporteBitacorasPage implements OnInit {

  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  bitacoraCE: bitacoraCambioEstado[] = [];
  bitacoraG: bitacoraGeneral[] = [];

  private destroy$ = new Subject<void>();  // Subject para gestionar la desuscripción
  idUsuarios: any;
  selectedOption: string = '';  // Nueva propiedad para la opción seleccionada

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getBitacoraCambioEstado();
    this.getBitacoraGeneral();
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
      this.getBitacoraCambioEstado();
      this.getBitacoraGeneral();
      event.target.complete();
    }, 1000);
  }

  async getBitacoraCambioEstado() {
    this.idUsuarios = await this.getIdUsuarios();
    this.bitacoraCE = [];

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allData = [];
        let processedUsers = 0;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          const path = `t_bitacora_cambio_estado/${this.idUsuarios[i].cn_id_usuario}/t_bitacora_cambio_estado`;

          this.loading = true;

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

                this.loading = false;

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

  async getBitacoraGeneral() {
    this.idUsuarios = await this.getIdUsuarios();
    this.bitacoraG = [];

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allData = [];
        let processedUsers = 0;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`;
          const path = `t_bitacora_general/${this.idUsuarios[i].cn_id_usuario}/t_bitacora_general`;

          this.loading = true;

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

                this.loading = false;

                console.log('bitacora general :', this.bitacoraG);
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
}
