// Importación de módulos y librerías necesarias
import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // Importa decoradores y funciones de Angular
import { Chart, registerables } from 'chart.js'; // Importa funcionalidades de Chart.js para gráficos
import { Subject } from 'rxjs'; // Importa Subject de RxJS para manejo de eventos y desuscripción
import { takeUntil, map } from 'rxjs/operators'; // Importa operadores de RxJS para transformación y control de flujo
import { Incidencia } from 'src/app/models/incidencia.model'; // Importa el modelo de Incidencia
import { FirebaseService } from 'src/app/services/firebase.service'; // Importa el servicio de Firebase
import { UtilsService } from 'src/app/services/utils.service'; // Importa el servicio de utilidades
Chart.register(...registerables); // Registra todos los elementos necesarios de Chart.js

// Decorador que define el componente, su selector, plantilla y estilos asociados
@Component({
  selector: 'app-reporte-trabajo-categoria', // Selector CSS para usar el componente
  templateUrl: './reporte-trabajo-categoria.page.html', // Ruta al archivo de plantilla
  styleUrls: ['./reporte-trabajo-categoria.page.scss'], // Ruta a los estilos específicos del componente
})
export class ReporteTrabajoCategoriaPage implements OnInit, OnDestroy { // Clase del componente con interfaces para ciclo de vida

  utilService = inject(UtilsService); // Inyección del servicio de utilidades
  firebaseService = inject(FirebaseService); // Inyección del servicio de Firebase
  loading: boolean = false; // Indicador de carga
  incidencia: Incidencia[] = []; // Array para almacenar incidencias
  idUsuarios: any; // Variable para almacenar IDs de usuarios
  private destroy$ = new Subject<void>();  // Subject para controlar la desuscripción de observables

  filteredIncidencias: Incidencia[] = []; // Array para incidencias filtradas
  searchTerm: string = ''; // Término de búsqueda
  categorias: string[] = ['Reparacion', 'Causa_natural', 'Atencion_mobiliario']; // Categorías predefinidas
  selectedCategory: string = ''; // Categoría seleccionada
  chart: any; // Variable para almacenar el gráfico

  ngOnInit() {
    this.getIncidencias(); // Método para obtener incidencias al iniciar
  }

  generarGrafica() { // Método para generar la gráfica
    const canvas = document.getElementById('myChart') as HTMLCanvasElement; // Obtiene el canvas del DOM
    const ctx = canvas.getContext('2d'); // Obtiene el contexto 2D del canvas
  
    if (this.chart) { // Destruye el gráfico existente si hay alguno
      this.chart.destroy();
    }
  
    const data = this.filteredIncidencias.map(item => item.cn_tecnicos); // Datos para el gráfico
    const labels = this.filteredIncidencias.map(item => item.ct_titulo); // Etiquetas para el gráfico

    // Creación del gráfico con Chart.js
    this.chart = new Chart(ctx, {
      type: 'bar', // Tipo de gráfico
      data: { // Datos del gráfico
        labels: labels,
        datasets: [{
          label: 'Cantidad de técnicos asignados',
          data: data,
          backgroundColor: [ // Colores de fondo
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [ // Colores de borde
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1 // Ancho del borde
        }]
      },
      options: { // Opciones del gráfico
        responsive: true, // Hace el gráfico responsivo
        plugins: { // Configuración de plugins
          legend: { // Leyenda
            position: 'top', // Posición de la leyenda
          },
          tooltip: { // Configuración de tooltips
            callbacks: { // Callbacks para personalizar los tooltips
              label: (tooltipItem: any) => { // Personaliza la etiqueta
                let label = tooltipItem.label || '';
  
                if (tooltipItem.raw) {
                  label += `: ${tooltipItem.raw}`;
                }
  
                return label;
              },
              title: (tooltipItems: any) => { // Personaliza el título
                return `Detalle`;
              },
              afterLabel: (tooltipItem: any) => { // Texto después de la etiqueta
                return `Más detalles`;
              }
            }
          }
        }
      }
    });
  }

  ionViewWillEnter() { // Método del ciclo de vida de Ionic, se ejecuta cuando la vista está por entrar
    this.getIncidencias(); // Llama al método para obtener incidencias
  }

  ngOnDestroy() { // Método del ciclo de vida de Angular, se ejecuta al destruir el componente
    this.destroy$.next(); // Emite un valor para desuscribirse
    this.destroy$.complete(); // Completa el Subject
  }

  getIdUsuarios(): Promise<any> { // Método para obtener IDs de usuarios
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

  doRefresh(event: any) { // Método para refrescar la lista de incidencias
    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000);
  }

  async getIncidencias() { // Método asincrónico para obtener incidencias
    this.idUsuarios = await this.getIdUsuarios();
    this.incidencia = []; // Limpia la lista de incidencias

    this.firebaseService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        let allIncidencias = []; // Lista para acumular incidencias
        let processedUsers = 0; // Contador de usuarios procesados

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`; // Ruta del usuario en Firebase
          const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`; // Ruta de incidencias en Firebase

          this.loading = true; // Indica que se está cargando

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
                allIncidencias = [...allIncidencias, ...resp]; // Agrega incidencias a la lista acumulada
                processedUsers++; // Incrementa el contador de usuarios procesados

                if (processedUsers === this.idUsuarios.length) { // Verifica si todos los usuarios han sido procesados
                  this.incidencia = allIncidencias; // Actualiza la lista de incidencias
                  this.filteredIncidencias = this.incidencia; // Actualiza las incidencias filtradas
                  this.generarGrafica(); // Genera la gráfica
                  this.loading = false; // Indica que ha terminado de cargar
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++; // Incrementa el contador de usuarios procesados

                if (processedUsers === this.idUsuarios.length) { // Verifica si todos los usuarios han sido procesados
                  this.loading = false; // Indica que ha terminado de cargar
                }
              }
            });

          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
            })
            .catch((error) => {
              console.error('Error obteniendo datos de usuario:', error);
            });
        }
      }
    });
  }

  filterIncidencias() { // Método para filtrar incidencias
    if (this.selectedCategory === '') {
      this.filteredIncidencias = this.incidencia; // Muestra todas las incidencias si no hay categoría seleccionada
    } else {
      this.filteredIncidencias = this.incidencia.filter(incidencia =>
        incidencia.cn_id_categoria.toLowerCase().includes(this.selectedCategory.toLowerCase())
      );
    }
    this.generarGrafica(); // Actualiza la gráfica después de filtrar
  }

}