import { Component, OnInit, inject } from '@angular/core';
import { User } from 'firebase/auth';
import { map } from 'rxjs';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Diagnostico } from 'src/app/models/diagnostico.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AsignarIncidenciaComponent } from 'src/app/shared/components/asignar-incidencia/asignar-incidencia.component';
import { DiagnosticoIncidenciaComponent } from 'src/app/shared/components/diagnostico-incidencia/diagnostico-incidencia.component';

@Component({
  selector: 'app-incidencias-reportadas',
  templateUrl: './incidencias-reportadas.page.html',
  styleUrls: ['./incidencias-reportadas.page.scss'],
})
export class IncidenciasReportadasPage implements OnInit {
  // Inyección de servicios y definición de variables
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  incidencia: Incidencia[] = [];
  idUsuarios: any;

  ngOnInit() {

  }

    // Método que se ejecuta cuando la vista está a punto de entrar y volverse la vista activa
  ionViewWillEnter(){
    
      this.getIncidencias();
  }  

  // Método para obtener los datos del usuario del almacenamiento local
  getIdUsuarior(): Promise<any> {
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
  doRefresh(event : any){

    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000)
  }

// Método para obtener la lista de incidencias reportadas
async getIncidencias() {
  this.idUsuarios = await this.getIdUsuarior();
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
          .getCollectionData(path)
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
                this.incidencia = allIncidencias;
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

// Para asignar incidencia

  // Método para asignar una incidencia
  async asignarIncidencia(asignaciones?: Asignaciones, incidencia?: Incidencia){

    console.log(incidencia);

    let modal = await this.utilService.getModal({
      component: AsignarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {asignaciones, incidencia}
    })
  }
  

}
