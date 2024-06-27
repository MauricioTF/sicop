import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';
import { Subject, map, takeUntil } from 'rxjs';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

interface TecnicoInfo {
  nombre: string;
  pendientes: number;
  terminadas: number;
}

@Component({
  selector: 'app-reporte-carga-trabajo',
  templateUrl: './reporte-carga-trabajo.page.html',
  styleUrls: ['./reporte-carga-trabajo.page.scss'],
})
export class ReporteCargaTrabajoPage implements OnInit {
  openI = true;
  openF = false;
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  incidencia: Incidencia[] = [];
  asignaciones: Asignaciones[] = [];
  tecnicos: TecnicoInfo[] = [];  // Cambiado a array de TecnicoInfo
  private destroy$ = new Subject<void>();  // Subject para gestionar la desuscripción
  idUsuarios: any;

  ngOnInit() {}

  dateForm: FormGroup;
  minDate: string;
  maxDate: string;

  constructor(private fb: FormBuilder) {
    const today = new Date();
    this.minDate = today.toISOString();
    const maxYear = new Date(today.setFullYear(today.getFullYear() + 75));
    this.maxDate = maxYear.toISOString();
    this.dateForm = this.fb.group({
      startDate: [this.minDate],
      endDate: [this.minDate]
    });
  }

  validateDates() {
    const startDate = this.dateForm.get('startDate').value;
    const endDate = this.dateForm.get('endDate').value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.dateForm.get('endDate').setValue('');
      alert('La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    if (startDate) {
      this.minDate = new Date(startDate).toISOString();
    }

    console.log('startDate: ', startDate, ' - endDate : ', endDate);
  }

  openFechaInicio() {
    this.openI = !this.openI;
    this.openF = false;
  }

  openFechaFin() {
    this.openF = !this.openF;
    this.openI = false;
  }

  ionViewWillEnter() {
    this.getIncidenciasAsignadas();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
                  this.asignaciones = allAsignacion;
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

    const startDate = new Date(this.dateForm.get('startDate').value);
    const endDate = new Date(this.dateForm.get('endDate').value);

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allIncidencias = [];
        let processedUsers = 0;
        let tecnicoIncidencias: { [key: string]: { nombre: string, pendientes: number, terminadas: number } } = {};

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

                for (let j = 0; j < this.asignaciones.length; j++) {
                  for (let k = 0; k < allIncidencias.length; k++) {
                    if (this.asignaciones[j].cn_id_incidencia === allIncidencias[k].id &&
                      allIncidencias[k].cn_id_usuario === this.idUsuarios[i].cn_id_usuario
                    ) {
                      // Filtrar incidencias por fecha
                      const incidenciaDate = new Date(allIncidencias[k].cf_fecha_hora); 
                      if (incidenciaDate >= startDate && incidenciaDate <= endDate) {
                        this.incidencia.push(allIncidencias[k]);

                        if (!tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario]) {
                          tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario] = {
                            nombre: this.idUsuarios[i].ct_nombre,
                            pendientes: 0,
                            terminadas: 0,
                          };
                        }

                        if (allIncidencias[k].cn_id_estado === 5) { 
                          tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario].terminadas++;
                        } else {
                          tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario].pendientes++;
                        }
                      }
                    }
                  }
                }

                if (processedUsers === this.idUsuarios.length) {
                  this.tecnicos = Object.values(tecnicoIncidencias);
                  this.loading = false;
                  console.log('tecnics : ',this.tecnicos);
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
}
