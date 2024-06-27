import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-asignar-incidencia',
  templateUrl: './asignar-incidencia.component.html',
  styleUrls: ['./asignar-incidencia.component.scss'],
})
export class AsignarIncidenciaComponent implements OnInit, OnDestroy {

  @Input() incidencia: Incidencia;

  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);

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

  form = new FormGroup({
    cn_id_asignacion_incidencia: new FormControl(1),
    cn_id_usuario: new FormControl(null, [Validators.required]),
    cn_id_incidencia: new FormControl(null),
    cn_id_afectacion: new FormControl('', []),
    cn_id_categoria: new FormControl('', []),
    cn_id_prioridad: new FormControl('', []),
    cn_id_riesgo: new FormControl('', []),
  });

  private destroy$ = new Subject<void>(); // Subject para gestionar la desuscripción

  ngOnInit() {
    this.form.controls.cn_id_incidencia.setValue(this.incidencia['id']);
    this.rolesXusuario().then((tecnicos) => {
      this.tecnicos = tecnicos;
      this.filtraTecnicosAsignados();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emitimos un valor para desuscribirnos de las subscripciones
    this.destroy$.complete(); // Completamos el Subject
  }

  async submit() {
    const selectedTecnicoId = this.form.get('cn_id_usuario')?.value;
    this.form.controls['cn_id_usuario'].setValue(selectedTecnicoId);

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

    this.asignarIncidencia();
    await this.firebaseService.bitacoraGeneral('Asignar incidencia',this.incidencia,String(this.user().cn_id_usuario), 'Asigna incidencia');
    await this.firebaseService.bitacoraCambioEstado(this.incidencia,String(this.user().cn_id_usuario), 2, 1); 
  }

  user(): User {
    return this.utilService.getLocalStorage('user');
  }

  async asignarIncidencia() {
    let path = `t_asignacion_incidencia/${this.user().cn_id_usuario}/t_asignacion_incidencia`;

    const loading = await this.utilService.loading();
    await loading.present();

    const asignacionData = {
      cn_id_asignacion_incidencia: this.form.value.cn_id_asignacion_incidencia,
      cn_id_usuario: this.form.value.cn_id_usuario,
      cn_id_incidencia: this.form.value.cn_id_incidencia,
    };

    this.firebaseService
      .addDocument(path, asignacionData)
      .then(async (resp) => {
        this.utilService.dismissModal({ success: true });

        this.firebaseService.actualizaTabla('/t_incidencias/',this.incidencia['id'], String(this.incidencia.cn_id_usuario), { cn_id_estado: 2 });
        this.firebaseService.actualizaTabla('/t_incidencias/',this.incidencia['id'], String(this.incidencia.cn_id_usuario), { cn_tecnicos: this.incidencia.cn_tecnicos+1 });

        this.utilService.presentToast({
          message: 'Asignación de incidencia agregada de manera exitosa',
          duration: 1500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
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
        loading.dismiss();
      });
  }

  async rolesXusuario() {
    this.usuarios = await this.getTecnicos();
    let u_tecnicos = [];

    for (let i = 0; i < this.usuarios.length; i++) {
      this.asignacion = await this.getAsignaciones(this.usuarios[i].cn_id_usuario);
      for (let j = 0; j < this.asignacion.length; j++) {
        this.u_asignaciones.push(this.asignacion[j]);
      }

      this.specificRole = await this.firebaseService.getSpecificRole(this.usuarios[i].cn_id_usuario);

      for (let j = 0; j < this.specificRole.length; j++) {
        if (this.specificRole[j].cn_id_rol === 4) {
          u_tecnicos.push(this.usuarios[i]);
        }
      }
    }

    return u_tecnicos;
  }

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

  filtraTecnicosAsignados() {
    for (let i = 0; i < this.u_asignaciones.length; i++) {
      for (let j = 0; j < this.tecnicos.length; j++) {
        if (this.u_asignaciones[i].cn_id_incidencia === this.incidencia['id'] && this.tecnicos[j].cn_id_usuario === this.u_asignaciones[i].cn_id_usuario) {
          this.tecnicos.splice(j, 1);
        }
      }
    }
  }

  datoVacio(field: any | null | undefined): boolean {
    return field === null || field === undefined || field.trim() === '';
  }
}
