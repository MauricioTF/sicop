import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
Chart.register(...registerables);

@Component({
  selector: 'app-reporte-trabajo-categoria',
  templateUrl: './reporte-trabajo-categoria.page.html',
  styleUrls: ['./reporte-trabajo-categoria.page.scss'],
})
export class ReporteTrabajoCategoriaPage implements OnInit, OnDestroy {

  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  incidencia: Incidencia[] = [];
  idUsuarios: any;
  private destroy$ = new Subject<void>();  // Subject para gestionar la desuscripción

  filteredIncidencias: Incidencia[] = []; // Incidencias filtradas
  searchTerm: string = ''; // Término de búsqueda
  // chart: Chart | null = null;

  categorias: string[] = ['Reparacion', 'Causa_natural', 'Atencion_mobiliario']; // Opciones preestablecidas para el ion-select
  selectedCategory: string = ''; // Categoría seleccionada por defecto
  chart: any;

  ngOnInit() {
    console.log("sel ",this.selectedCategory);
    this.getIncidencias();
  }

  generarGrafica() {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    // Destruir el gráfico existente antes de crear uno nuevo
    if (this.chart) {
      this.chart.destroy();
    }
  

    const data = this.filteredIncidencias.map(item => item.cn_tecnicos);
    const labels = this.filteredIncidencias.map(item => item.ct_titulo);

    this.chart = new Chart(ctx, {
      type: 'doughnut', // Cambiar el tipo a 'doughnut' para gráfico de anillos
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de técnicos asignados',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
            // Puedes añadir más colores si tienes más categorías
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem: any) => {
                let label = tooltipItem.label || '';
  
                if (tooltipItem.raw) {
                  label += `: ${tooltipItem.raw}`;
                }
  
                return label;
              },
              // Personaliza el texto del título del tooltip
              title: (tooltipItems: any) => {
                // Puedes personalizar el título aquí
                return `Detalle`;
              },
              // Personaliza el cuerpo del tooltip
              afterLabel: (tooltipItem: any) => {
                // Puedes agregar información adicional después del cuerpo principal aquí
                return `Más detalles`;
              }
            }
          }
        }
      }
    
    });
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
                  this.generarGrafica();
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

  // Método para filtrar incidencias
  filterIncidencias() {
    if (this.selectedCategory === '') {
      this.filteredIncidencias = this.incidencia; // Mostrar todas las incidencias si el término de búsqueda está vacío
    } else {
      this.filteredIncidencias = this.incidencia.filter(incidencia =>
        incidencia.cn_id_categoria.toLowerCase().includes(this.selectedCategory.toLowerCase())
      );
    }
    this.generarGrafica(); // Actualizar la gráfica después de filtrar
  }

}
