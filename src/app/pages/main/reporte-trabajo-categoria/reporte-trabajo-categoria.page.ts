import { Component, OnInit, inject } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-reporte-trabajo-categoria',
  templateUrl: './reporte-trabajo-categoria.page.html',
  styleUrls: ['./reporte-trabajo-categoria.page.scss'],
})
export class ReporteTrabajoCategoriaPage implements OnInit {

  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  incidencia: Incidencia[] = [];
  idUsuarios: any;
  private destroy$ = new Subject<void>();  // Subject para gestionar la desuscripción

  filteredIncidencias: Incidencia[] = []; // Incidencias filtradas
  searchTerm: string = ''; // Término de búsqueda
  chart: Chart;

  constructor() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: 'Linechart'
      },
      credits: {
        enabled: false
      },
      series: [
        {
          name: 'Line 1',
          type: 'line',
          data: [1, 2, 3, 4, 5, 6, 7]
        }
      ]
    });
  }

  ngOnInit() {
  }



  // ionViewWillEnter() {
  //   this.getIncidencias();  // Llamamos al método para obtener incidencias cuando la vista está a punto de entrar
  // }

  // // Método que se ejecuta cuando el componente se destruye
  // ngOnDestroy() {
  //   this.destroy$.next();   // Emitimos un valor para desuscribirnos de las subscripciones
  //   this.destroy$.complete(); // Completamos el Subject
  // }

  // // Método para obtener los usuarios del servicio Firebase
  // getIdUsuarios(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.firebaseService.getTecnicos().pipe(takeUntil(this.destroy$)).subscribe(
  //       (data) => {
  //         const usuarios = data;
  //         resolve(usuarios);
  //       },
  //       (error) => {
  //         console.error('Error al obtener roles:', error);
  //         reject(error);
  //       }
  //     );
  //   });
  // }

  // // Método para refrescar la lista de incidencias
  // doRefresh(event: any) {
  //   setTimeout(() => {
  //     this.getIncidencias();
  //     event.target.complete();
  //   }, 1000);
  // }

  // // Método para obtener las incidencias reportadas
  // async getIncidencias() {
  //   this.idUsuarios = await this.getIdUsuarios();
  //   this.incidencia = []; // Limpiamos la lista de incidencias antes de actualizar

  //   this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
  //     if (user) {
  //       let allIncidencias = []; // Lista para acumular todas las incidencias
  //       let processedUsers = 0; // Contador para usuarios procesados

  //       for (let i = 0; i < this.idUsuarios.length; i++) {
  //         const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`; // Ruta del usuario
  //         const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`; // Ruta de la incidencia

  //         this.loading = true;

  //         this.firebaseService
  //           .getCollectionDataIncidencia(path)
  //           .snapshotChanges()
  //           .pipe(
  //             map((changes) =>
  //               changes.map((c) => ({
  //                 id: c.payload.doc.id,
  //                 ...c.payload.doc.data(),
  //               }))
  //             ),
  //             takeUntil(this.destroy$)
  //           )
  //           .subscribe({
  //             next: (resp: any) => {
  //               allIncidencias = [...allIncidencias, ...resp]; // Agregamos incidencias a la lista acumulada
  //               processedUsers++;

  //               // Verificamos si todos los usuarios han sido procesados
  //               if (processedUsers === this.idUsuarios.length) {
  //                 // Filtramos las incidencias que no estén terminadas (estado != 5)
  //                 this.incidencia = allIncidencias.filter(incidencia => incidencia.cn_id_estado !== 5);
  //                 this.filteredIncidencias = this.incidencia; // Mostrar todas las incidencias inicialmente

  //                 this.loading = false;
  //               }
  //             },
  //             error: (error) => {
  //               console.error('Error obteniendo incidencias:', error);
  //               processedUsers++;

  //               // Manejamos el estado de carga en caso de errores
  //               if (processedUsers === this.idUsuarios.length) {
  //                 this.loading = false;
  //               }
  //             }
  //           });

  //         this.firebaseService
  //           .getDocument(userPath)
  //           .then((userData) => {
  //             // Manejamos otros datos del usuario aquí si es necesario
  //           })
  //           .catch((error) => {
  //             console.error('Error obteniendo datos de usuario:', error);
  //           });
  //       }
  //     }
  //   });
  // }

  //  // Método para filtrar incidencias
  //  filterIncidencias() {
  //   if (this.searchTerm === '') {
  //     this.filteredIncidencias = this.incidencia; // Mostrar todas las incidencias si el término de búsqueda está vacío
  //   } else {
  //     this.filteredIncidencias = this.incidencia.filter(incidencia =>
  //       incidencia.cn_id_categoria.toLowerCase().includes(this.searchTerm.toLowerCase())
  //     );
  //   }
  // }

}
