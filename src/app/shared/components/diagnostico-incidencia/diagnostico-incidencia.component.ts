// Importación de módulos y servicios necesarios
import { Component, Inject, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

// Decorador Component que define la configuración del componente
@Component({
  selector: 'app-diagnostico-incidencia',
  templateUrl: './diagnostico-incidencia.component.html',
  styleUrls: ['./diagnostico-incidencia.component.scss'],
})
export class DiagnosticoIncidenciaComponent implements OnInit {
   // Inyección de servicios y definición de variables
  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);

  userId: string | null = null;
  
  @Input() incidencia: Incidencia;

    // Definición del formulario
  form = new FormGroup({
    cn_id_diagnostico: new FormControl(1),
    cn_id_usuario: new FormControl(null),
    cn_id_incidencia: new FormControl(null),
    cf_fecha_hora: new FormControl(null),
    ct_descripcion: new FormControl('', [Validators.required]),
    ct_tiempo_estimado_solucion: new FormControl('', [Validators.required]),
    ct_observaciones: new FormControl('', [Validators.required]),
    ct_id_img: new FormControl('', [Validators.required]),
  });

    // Método que se ejecuta al inicializar el componente
  ngOnInit() {

    this.form.controls.cn_id_incidencia.setValue(this.incidencia['id']);

    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        const userPath = `t_usuarios/${this.userId}`; // Asegúrate de que el path sea correcto según tu estructura de datos
        
        this.firebaseService.getDocument(userPath).then(userData => {
          this.form.controls.cn_id_usuario.setValue(this.userId);

        }).catch(error => {
          console.error('Error obteniendo datos de usuario', error);
        });
      }
    });

  }

    // Método que se ejecuta al enviar el formulario
  async submit() {

    this.form.controls.cf_fecha_hora.setValue(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    this.crearDiagnostico();
  }

  // Método para crear el diagnóstico
  async crearDiagnostico() {

      if (!this.userId) {
        console.error('El UID del usuario no está definido');
        this.utilService.presentToast({
          message: 'Error: El UID del usuario no está definido',
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
        return;
      }
  
      let path = `t_diagnosticos/${this.userId}/t_diagnosticos`;
      
      console.log('Path de la incidencia:', path);
  
      const loading = await this.utilService.loading();
      await loading.present();
  
      let dataUrl = this.form.value.ct_id_img;//valor de la imagen seleccionada
      let imgPath = `${this.userId}/${Date.now()}`//path unico para la imagen
      let imgUrl = await this.firebaseService.updateImg(imgPath, dataUrl);
   
      this.form.controls.ct_id_img.setValue(imgUrl);
      //delete this.form.value.cn_id_incidencia; // Elimina el id y toma el uid creado
    
      this.firebaseService
        .addDocument(path, this.form.value)
        .then(async (resp) => {
          this.utilService.dismissModal({ success: true });//para cerrar el modal automaticamente
  
          //mensaje de exito al guardar los datos
          this.utilService.presentToast({
            message: 'Diagnostico agregado de manera exitosa',
            duration: 1500,
            color: 'primary',
            position: 'bottom',
            icon: 'checkmark-circle-outline',
          });
        })
        //mensaje de error al guardar los datos
        .catch((error) => {
          console.error('Error al agregar el diagnostico:', error);
          this.utilService.presentToast({
            message: error.message,
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

  // Método para obtener las fotos
  async takeImage() {
    const dataUrl = (
      await this.utilService.takePicture('Foto de la incidencia')
    ).dataUrl; // Extrae la respuesta que se selecciona
    this.form.controls.ct_id_img.setValue(dataUrl);
  }
}
