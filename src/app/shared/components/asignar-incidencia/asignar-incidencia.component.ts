// Importa módulos y componentes de Angular, RxJS, modelos y servicios necesarios.
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

// Decorador que define el componente, su selector, ruta de la plantilla y hojas de estilo.
@Component({
  selector: 'app-asignar-incidencia',
  templateUrl: './asignar-incidencia.component.html',
  styleUrls: ['./asignar-incidencia.component.scss'],
})
// Clase del componente que implementa OnInit y OnDestroy para manejar el ciclo de vida del componente.
export class AsignarIncidenciaComponent implements OnInit, OnDestroy {

  @Input() incidencia: Incidencia; // Propiedad de entrada que recibe una incidencia.

  // Inyección de servicios.
  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);

  // Declaración de variables para manejar usuarios, incidencias y asignaciones.
  t_usuarios = {} as User;
  t_incidencia = {} as Incidencia;
  userId: string | null = null;

  specificRole: any;
  usuarios: any;
  asignacion: any;
  id_rol_usuario: any;

  tecnicos: User[] = [];
  selectedTecnicoId: string | null = null;
  u_asignaciones = [];
  idUsuarios: any;

  // Declaración y configuración del formulario reactivo.
  form = new FormGroup({
    cn_id_asignacion_incidencia: new FormControl(1),
    cn_id_usuario: new FormControl(null, [Validators.required]),
    cn_id_incidencia: new FormControl(null),
    cn_id_afectacion: new FormControl('', []),
    cn_id_categoria: new FormControl('', []),
    cn_id_prioridad: new FormControl('', []),
    cn_id_riesgo: new FormControl('', []),
  });

  private destroy$ = new Subject<void>(); // Subject para gestionar la desuscripción.

  // Método que se ejecuta al iniciar el componente.
  ngOnInit() {
    this.form.controls.cn_id_incidencia.setValue(this.incidencia['id']); // Asigna el ID de la incidencia al formulario.
    this.rolesXusuario().then((tecnicos) => { // Obtiene los técnicos y filtra los asignados.
      this.tecnicos = tecnicos;
      this.filtraTecnicosAsignados();
    });
  }

  // Método que se ejecuta al destruir el componente.
  ngOnDestroy() {
    this.destroy$.next(); // Emitimos un valor para desuscribirnos de las subscripciones.
    this.destroy$.complete(); // Completamos el Subject.
  }

  // Método para procesar el formulario de asignación.
  async submit() {
    const selectedTecnicoId = this.form.get('cn_id_usuario')?.value; // Obtiene el ID del técnico seleccionado.
    this.form.controls['cn_id_usuario'].setValue(selectedTecnicoId); // Asigna el ID del técnico al formulario.

    // Bucle para enviar un correo al técnico seleccionado.
    for (let i = 0; i < this.tecnicos.length; i++) {
      console.log(selectedTecnicoId, this.tecnicos[i].cn_id_usuario);
      if(selectedTecnicoId == this.tecnicos[i].cn_id_usuario){
        console.log(selectedTecnicoId, '==', this.tecnicos[i].cn_id_usuario);

        // Llama al servicio para enviar un correo electrónico.
        this.firebaseService.sendEmail(this.tecnicos[i].ct_correo, "Nueva asignación", "Hola!! "+this.tecnicos[i].ct_nombre+" Se te ha asignado una nueva asignación, esperamos puedas resolverla pronto.")
        .subscribe(
          response => {
    
          },
          error => {
    
          }
        );
      }
    }

    // Actualiza la incidencia si los campos están vacíos.
    if (String(this.incidencia.cn_id_prioridad) === "" && String(this.incidencia.cn_id_afectacion) === "" &&
      String(this.incidencia.cn_id_categoria) === "" && String(this.incidencia.cn_id_riesgo) === "") {
      const incidenciaData = {
        cn_id_afectacion: this.form.value.cn_id_afectacion,
        cn_id_categoria: this.form.value.cn_id_categoria,
        cn_id_prioridad: this.form.value.cn_id_prioridad,
        cn_id_riesgo: this.form.value.cn_id_riesgo,
      };

      await this.firebaseService.actualizaTabla('/t_incidencias/',this.incidencia['id'], String(this.incidencia.cn_id_usuario), incidenciaData);
    
    }

    // Llama al método para asignar la incidencia y registra en bitácora.
    this.asignarIncidencia();
    await this.firebaseService.bitacoraGeneral('Asignar incidencia',this.incidencia,String(this.user().cn_id_usuario), 'Asigna incidencia');
    await this.firebaseService.bitacoraCambioEstado(this.incidencia,String(this.user().cn_id_usuario), 2, 1); 
  }

  // Método para obtener el usuario actual desde el servicio de utilidades.
  user(): User {
    return this.utilService.getLocalStorage('user');
  }

  // Método para asignar la incidencia en la base de datos.
  async asignarIncidencia() {
    let path = `t_asignacion_incidencia/${this.user().cn_id_usuario}/t_asignacion_incidencia`;

    const loading = await this.utilService.loading(); // Muestra un indicador de carga.
    await loading.present();

    const asignacionData = {
      cn_id_asignacion_incidencia: this.form.value.cn_id_asignacion_incidencia,
      cn_id_usuario: this.form.value.cn_id_usuario,
      cn_id_incidencia: this.form.value.cn_id_incidencia,
    };

    // Añade el documento de asignación y actualiza la incidencia.
    this.firebaseService
      .addDocument(path, asignacionData)
      .then(async (resp) => {
        this.utilService.dismissModal({ success: true });

        // Actualiza el estado de la incidencia y el contador de técnicos asignados.
        this.firebaseService.actualizaTabla('/t_incidencias/',this.incidencia['id'], String(this.incidencia.cn_id_usuario), { cn_id_estado: 2 });
        this.firebaseService.actualizaTabla('/t_incidencias/',this.incidencia['id'], String(this.incidencia.cn_id_usuario), { cn_tecnicos: this.incidencia.cn_tecnicos+1 });

        // Muestra un mensaje de éxito.
        this.utilService.presentToast({
          message: 'Asignación de incidencia agregada de manera exitosa',
          duration: 1500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        // Muestra un mensaje de error en caso de fallo.
        console.error('Error al asignar incidencia:', error);
        this.utilService.presentToast({
          message: 'Error al asignar incidencia, intente nuevamente.',
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss(); // Oculta el indicador de carga.
      });
  }

  // Método para obtener los técnicos y filtrarlos según su rol.
  async rolesXusuario() {
    this.usuarios = await this.getTecnicos(); // Obtiene todos los técnicos.
    let u_tecnicos = [];

    // Bucle para filtrar técnicos según asignaciones y roles específicos.
    for (let i = 0; i < this.usuarios.length; i++) {
      this.asignacion = await this.getAsignaciones(this.usuarios[i].cn_id_usuario);
      for (let j = 0; j < this.asignacion.length; j++) {
        this.u_asignaciones.push(this.asignacion[j]);
      }

      this.specificRole = await this.firebaseService.getSpecificRole(this.usuarios[i].cn_id_usuario);

      for (let j = 0; j < this.specificRole.length; j++) {
        if (this.specificRole[j].cn_id_rol === 4) { // Filtra por el rol de técnico.
          u_tecnicos.push(this.usuarios[i]);
        }
      }
    }

    return u_tecnicos; // Retorna los técnicos filtrados.
  }

  // Método para obtener las asignaciones de un usuario.
  getAsignaciones(uid): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getAsignaciones(uid).pipe(takeUntil(this.destroy$)).subscribe(
        data => {
          const asignacion = data;
          resolve(asignacion);
        },
        error => {
          console.error('Error al obtener roles:', error);
          reject(error);
        }
      );
    });
  }

  // Método para obtener todos los técnicos.
  async getTecnicos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getTecnicos().pipe(takeUntil(this.destroy$)).subscribe(
        data => {
          const tecnicos = data;
          resolve(tecnicos);
        },
        error => {
          console.error('Error al obtener roles:', error);
          reject(error);
        }
      );
    });
  }

  // Método para filtrar técnicos ya asignados a la incidencia.
  filtraTecnicosAsignados() {
    for (let i = 0; i < this.u_asignaciones.length; i++) {
      for (let j = 0; j < this.tecnicos.length; j++) {
        if (this.u_asignaciones[i].cn_id_incidencia === this.incidencia['id'] && this.tecnicos[j].cn_id_usuario === this.u_asignaciones[i].cn_id_usuario) {
          this.tecnicos.splice(j, 1); // Elimina el técnico ya asignado de la lista.
        }
      }
    }
  }

  // Método para verificar si un campo está vacío.
  datoVacio(field: any | null | undefined): boolean {
    return field === null || field === undefined || field.trim() === ''; // Verifica si el campo está vacío.
  }
}