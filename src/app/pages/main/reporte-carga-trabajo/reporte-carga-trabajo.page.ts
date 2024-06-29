// Importación de módulos y servicios necesarios para el componente.
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';
import { Subject, map, takeUntil } from 'rxjs';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

// Definición de la interfaz para almacenar la información del técnico.
interface TecnicoInfo {
  nombre: string;
  pendientes: number;
  terminadas: number;
}

// Decorador del componente con metadatos como el selector, la plantilla HTML y el estilo.
@Component({
  selector: 'app-reporte-carga-trabajo',
  templateUrl: './reporte-carga-trabajo.page.html',
  styleUrls: ['./reporte-carga-trabajo.page.scss'],
})
// Definición de la clase del componente.
export class ReporteCargaTrabajoPage implements OnInit {
  openI = true; // Controla la visibilidad del selector de fecha de inicio.
  openF = false; // Controla la visibilidad del selector de fecha de fin.
  utilService = inject(UtilsService); // Inyecta el servicio de utilidades.
  firebaseService = inject(FirebaseService); // Inyecta el servicio de Firebase.
  loading: boolean = false; // Estado de carga para mostrar un indicador mientras se obtienen datos.
  incidencia: Incidencia[] = []; // Array para almacenar las incidencias.
  asignaciones: Asignaciones[] = []; // Array para almacenar las asignaciones.
  tecnicos: TecnicoInfo[] = []; // Array para almacenar la información del técnico.
  private destroy$ = new Subject<void>(); // Subject para gestionar la desuscripción.
  idUsuarios: any; // Variable para almacenar los ID de los usuarios.

  ngOnInit() {} // Método del ciclo de vida que se llama al inicializar el componente.

  dateForm: FormGroup; // Formulario reactivo para manejar las fechas.
  minDate: string; // Fecha mínima para el selector de fechas.
  maxDate: string; // Fecha máxima para el selector de fechas.

  // Constructor del componente, inicializa el formulario de fechas.
  constructor(private fb: FormBuilder) {
    const today = new Date(); // Obtiene la fecha actual.
    this.minDate = today.toISOString(); // Convierte la fecha actual a ISO string.
    const maxYear = new Date(today.setFullYear(today.getFullYear() + 75)); // Calcula la fecha máxima sumando 75 años a la fecha actual.
    this.maxDate = maxYear.toISOString(); // Convierte la fecha máxima a ISO string.
    this.dateForm = this.fb.group({
      startDate: [this.minDate], // Inicializa el campo startDate con la fecha mínima.
      endDate: [this.minDate], // Inicializa el campo endDate con la fecha mínima.
    });
  }

  // Método para validar las fechas seleccionadas en el formulario.
  validateDates() {
    const startDate = this.dateForm.get('startDate').value; // Obtiene la fecha de inicio del formulario.

    // Actualiza la fecha mínima si se selecciona una fecha de inicio.
    if (startDate) {
      this.minDate = new Date(startDate).toISOString();
    }
  }

  // Método para abrir o cerrar el selector de fecha de inicio.
  openFechaInicio() {
    this.openI = !this.openI; // Alterna el valor de openI.
    this.openF = false; // Cierra el selector de fecha de fin.
  }

  // Método para abrir o cerrar el selector de fecha de fin.
  openFechaFin() {
    this.openF = !this.openF; // Alterna el valor de openF.
    this.openI = false; // Cierra el selector de fecha de inicio.
  }

  // Método del ciclo de vida que se llama cuando la vista está a punto de entrar.
  ionViewWillEnter() {
    this.getIncidenciasAsignadas(); // Llama a la función para obtener incidencias asignadas.
  }

  // Método del ciclo de vida que se llama cuando el componente se destruye.
  ngOnDestroy() {
    this.destroy$.next(); // Emite un valor para completar todas las suscripciones.
    this.destroy$.complete(); // Completa el Subject para la desuscripción.
  }

  // Método para obtener los ID de los usuarios desde Firebase.
  getIdUsuarios(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService
        .getTecnicos() // Llama al servicio para obtener los técnicos.
        .pipe(takeUntil(this.destroy$)) // Toma hasta que se destruya el componente.
        .subscribe(
          (data) => {
            const usuarios = data; // Asigna los datos obtenidos a usuarios.
            resolve(usuarios); // Resuelve la promesa con los usuarios.
          },
          (error) => {
            console.error('Error al obtener roles:', error); // Muestra un error en la consola.
            reject(error); // Rechaza la promesa con el error.
          }
        );
    });
  }

  // Método para obtener las incidencias asignadas a los técnicos.
  async getIncidenciasAsignadas() {
    this.idUsuarios = await this.getIdUsuarios(); // Obtiene los ID de los usuarios.
    this.asignaciones = []; // Inicializa el array de asignaciones.
    this.incidencia = []; // Inicializa el array de incidencias.

    this.firebaseService
      .getCurrentUser() // Obtiene el usuario actual.
      .pipe(takeUntil(this.destroy$)) // Toma hasta que se destruya el componente.
      .subscribe((user) => {
        if (user) {
          let allAsignacion = []; // Inicializa el array para almacenar todas las asignaciones.
          this.loading = true; // Activa el estado de carga.

          // Itera sobre los ID de los usuarios.
          for (let i = 0; i < this.idUsuarios.length; i++) {
            const path = `t_asignacion_incidencia/${this.idUsuarios[i].cn_id_usuario}/t_asignacion_incidencia`;

            this.firebaseService
              .getCollectionDataIncidenciasAsignadas(path) // Obtiene los datos de incidencias asignadas desde Firebase.
              .snapshotChanges() // Escucha los cambios en la colección.
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
                  allAsignacion = [...allAsignacion, ...resp]; // Añade las nuevas asignaciones al array.
                  this.asignaciones = allAsignacion; // Actualiza las asignaciones.
                  this.getIncidencias(); // Llama al método para obtener incidencias.
                  this.loading = false; // Desactiva el estado de carga.
                },
                error: (error) => {
                  console.error('Error obteniendo incidencias:'); // Muestra un error en la consola.
                  this.loading = false; // Desactiva el estado de carga.
                },
              });
          }
        }
      });
  }

  // Método para obtener todas las incidencias.
  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarios(); // Obtiene los ID de los usuarios.
    this.incidencia = []; // Inicializa el array de incidencias.

    this.firebaseService
      .getCurrentUser() // Obtiene el usuario actual.
      .pipe(takeUntil(this.destroy$)) // Toma hasta que se destruya el componente.
      .subscribe((user) => {
        if (user) {
          let allIncidencias = []; // Inicializa el array para almacenar todas las incidencias.

          // Itera sobre los ID de los usuarios.
          for (let i = 0; i < this.idUsuarios.length; i++) {
            const path = `t_incidencias/${this.idUsuarios[i].cn_id_usuario}/t_incidencias`;

            this.firebaseService
              .getCollectionDataIncidenciaByPriority(path) // Obtiene los datos de incidencias desde Firebase.
              .snapshotChanges() // Escucha los cambios en la colección.
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
                  allIncidencias = [...allIncidencias, ...resp]; // Añade las nuevas incidencias al array.

                  this.incidencia = allIncidencias; // Actualiza las incidencias.
                  this.cargaTrabajo(); // Llama al método para calcular la carga de trabajo.
                  this.loading = false; // Desactiva el estado de carga.
                },
                error: (error) => {
                  console.error('Error obteniendo incidencias:', error); // Muestra un error en la consola.

                    this.loading = false; // Desactiva el estado de carga.
                },
              });
          }
        }
      });
  }

  // Método para calcular la carga de trabajo de cada técnico.
  async cargaTrabajo() {
    this.idUsuarios = await this.getIdUsuarios(); // Obtiene los ID de los usuarios.

    const startDate = new Date(this.dateForm.get('startDate').value); // Convierte la fecha de inicio del formulario a Date.
    const endDate = new Date(this.dateForm.get('endDate').value); // Convierte la fecha de fin del formulario a Date.
    let tecnicoIncidencias: {
      [key: string]: { nombre: string; pendientes: number; terminadas: number };
    } = {}; // Objeto para almacenar la información de las incidencias por técnico.

    // Itera sobre las asignaciones.
    for (let i = 0; i < this.asignaciones.length; i++) {
      // Itera sobre las incidencias.
      for (let j = 0; j < this.incidencia.length; j++) {
        if (
          this.asignaciones[i].cn_id_usuario ===
          this.idUsuarios[i].cn_id_usuario
        ) {
          const incidenciaDate = new Date(this.incidencia[j]['cf_fecha_hora']); // Convierte la fecha de la incidencia a Date.
          if (incidenciaDate >= startDate && incidenciaDate <= endDate) {
            // Verifica si la incidencia está dentro del rango de fechas.

            if (!tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario]) {
              tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario] = {
                nombre: this.idUsuarios[i].ct_nombre,
                pendientes: 0,
                terminadas: 0,
              };
            }


            if (this.incidencia[j]['cn_id_estado'] === 5) {
              // verifica si la incidencia está finalizada
              tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario].terminadas++;// aumenta las terminadas
            } else {
              tecnicoIncidencias[this.idUsuarios[i].cn_id_usuario].pendientes++;// amuneta las pendientes
            }
          }

          this.tecnicos = Object.values(tecnicoIncidencias); // Actualiza el array de técnicos con la información calculada.
          this.loading = false; // Desactiva el estado de carga.
        }
      }
    }
  }
}
