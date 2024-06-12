import { Component, OnInit, inject } from '@angular/core';
import { map } from 'rxjs';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Diagnostico } from 'src/app/models/diagnostico.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DiagnosticoIncidenciaComponent } from 'src/app/shared/components/diagnostico-incidencia/diagnostico-incidencia.component';

@Component({
  selector: 'app-incidencias-asignadas',
  templateUrl: './incidencias-asignadas.page.html',
  styleUrls: ['./incidencias-asignadas.page.scss'],
})
export class IncidenciasAsignadasPage implements OnInit {
  // Inyección de servicios y definición de variables
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  asignaciones: Asignaciones[] = [];
  incidencia: Incidencia[] = [];
  idUsuarios: any;

  sepcificAsignation: any;

  ngOnInit() {}

  // Método que se ejecuta cuando la vista está a punto de entrar y volverse la vista activa
  ionViewWillEnter() {
    this.getIncidenciasAsignadas();
  }

  // Método para obtener los datos del usuario del almacenamiento local
  getIdUsuarios(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getTecnicos().subscribe(
        (data) => {
          const usuarios = data;
          resolve(usuarios);
        },
        (error) => {
          console.error('Error al obtener roles:', error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }

  // Método para refrescar la pantalla
  doRefresh(event: any) {
    setTimeout(() => {
      this.getIncidenciasAsignadas();
      event.target.complete();
    }, 1000);
  }

  // Método para obtener la lista de incidencias reportadas
  async getIncidenciasAsignadas() {
    this.idUsuarios = await this.getIdUsuarios();
    this.asignaciones = []; // Asegúrate de inicializar la lista de incidencias

    this.incidencia = [];

    this.firebaseService.getCurrentUser().subscribe((user) => {
      if (user) {
        let allIncidencias = []; // Lista para acumular todas las incidencias
        let allA = []; // Lista para acumular todas las incidencias

        let processedUsers = 0; // Contador para usuarios procesados
        this.loading = true;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`; // Ruta del usuario
          const path = `t_asignacion_incidencia/${this.idUsuarios[i].cn_id_usuario}/t_asignacion_incidencia`; // Ruta de la incidencia

          const userPathIncidencia = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`; // Ruta del usuario
          const pathIncidencia = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`; // Ruta de la incidencia

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
              )
            )
            .subscribe({
              next: (resp: any) => {
                allA = [...allA, ...resp]; // Agregar incidencias a la lista acumulada
                processedUsers++;
                // Verificar si todos los usuarios han sido procesados
                if (processedUsers === this.idUsuarios.length) {
                  this.asignaciones = allA.filter(
                    (incidencia) => incidencia.cn_id_usuario === user.uid
                  );
                  console.log('Asignaciones:', this.asignaciones);
                  this.getIncidencias();
                  this.loading = false;
                  // this.useAsignaciones(); // Llama a useAsignaciones cuando los datos estén listos
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;

                // Asegúrate de manejar el estado de carga incluso si hay errores
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

  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarios();
    this.incidencia = []; // Asegúrate de inicializar la lista de incidencias

    this.firebaseService.getCurrentUser().subscribe((user) => {
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
              )
            )
            .subscribe({
              next: (resp: any) => {
                allIncidencias = [...allIncidencias, ...resp]; // Agregar incidencias a la lista acumulada
                processedUsers++;

                // Verificar si todos los usuarios han sido procesados
                if (processedUsers === this.idUsuarios.length) {
                  for (let i = 0; i < this.asignaciones.length; i++) {
                    for (let j = 0; j < allIncidencias.length; j++) {
                      if (
                        this.asignaciones[i].cn_id_incidencia ==
                        allIncidencias[j].id
                      ) {
                        this.incidencia.push(allIncidencias[j]);
                      }
                    }
                  }
                  // this.incidencia = allIncidencias;
                  this.loading = false;
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;

                // Asegúrate de manejar el estado de carga incluso si hay errores
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

  // Método para agregar un diagnóstico
  async addDiagnostico(diagnostico?: Diagnostico, incidencia?: Incidencia) {
    console.log(incidencia);

    let modal = await this.utilService.getModal({
      component: DiagnosticoIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: { diagnostico, incidencia },
    });
  }
}
