// Importación de módulos y servicios necesarios
import { Component, Inject, Input, OnInit, inject } from '@angular/core'; // Importa los decoradores y funciones necesarias de Angular
import { FormControl, FormGroup, Validators } from '@angular/forms'; // Importa clases para manejar formularios reactivos y validaciones
import { Incidencia } from 'src/app/models/incidencia.model'; // Importa el modelo de Incidencia
import { FirebaseService } from 'src/app/services/firebase.service'; // Importa el servicio para interactuar con Firebase
import { UtilsService } from 'src/app/services/utils.service'; // Importa el servicio de utilidades

// Decorador Component que define la configuración del componente
@Component({
  selector: 'app-diagnostico-incidencia', // Selector CSS para usar el componente
  templateUrl: './diagnostico-incidencia.component.html', // Ruta del archivo de plantilla del componente
  styleUrls: ['./diagnostico-incidencia.component.scss'], // Ruta de los estilos específicos del componente
})
export class DiagnosticoIncidenciaComponent implements OnInit { // Define la clase del componente
   // Inyección de servicios y definición de variables
  firebaseService = inject(FirebaseService); // Inyecta el servicio FirebaseService
  utilService = inject(UtilsService); // Inyecta el servicio UtilsService

  userId: string | null = null; // Define una variable para almacenar el ID del usuario, inicialmente nula
  
  @Input() incidencia: Incidencia; // Decorador Input para recibir un objeto Incidencia como entrada del componente

    // Definición del formulario
  form = new FormGroup({ // Crea un nuevo grupo de controles para el formulario
    cn_id_diagnostico: new FormControl(1), // Control para el ID del diagnóstico, con valor inicial 1
    cn_id_usuario: new FormControl(null), // Control para el ID del usuario, inicialmente nulo
    cn_id_incidencia: new FormControl(null), // Control para el ID de la incidencia, inicialmente nulo
    cf_fecha_hora: new FormControl(null), // Control para la fecha y hora, inicialmente nulo
    ct_descripcion: new FormControl('', [Validators.required]), // Control para la descripción, requerido
    cn_tiempo_estimado_solucion: new FormControl('', [Validators.required]), // Control para el tiempo estimado de solución, requerido
    ct_observaciones: new FormControl('', [Validators.required]), // Control para las observaciones, requerido
    cn_id_img: new FormControl('', [Validators.required]), // Control para el ID de la imagen, requerido
  });

    // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    this.form.controls.cn_id_incidencia.setValue(this.incidencia['id']); // Asigna el ID de la incidencia al control correspondiente

    this.firebaseService.getCurrentUser().subscribe(user => { // Obtiene el usuario actual de Firebase
      if (user) { // Si hay un usuario
        this.userId = user.uid; // Asigna el UID del usuario a la variable
        const userPath = `t_usuarios/${this.userId}`; // Define el path del documento del usuario en Firebase
        
        this.firebaseService.getDocument(userPath).then(userData => { // Obtiene el documento del usuario
          this.form.controls.cn_id_usuario.setValue(this.userId); // Asigna el UID del usuario al control correspondiente

        }).catch(error => { // En caso de error al obtener el documento
          console.error('Error obteniendo datos de usuario', error); // Muestra el error en consola
        });
      }
    });
  }

    // Método que se ejecuta al enviar el formulario
  async submit() {
    this.form.controls.cf_fecha_hora.setValue(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' })); // Asigna la fecha y hora actual al control correspondiente
    this.crearDiagnostico(); // Llama al método para crear el diagnóstico
  }

  // Método para crear el diagnóstico
  async crearDiagnostico() {
      if (!this.userId) { // Si el UID del usuario no está definido
        console.error('El UID del usuario no está definido'); // Muestra un error en consola
        this.utilService.presentToast({ // Muestra un mensaje de error
          message: 'Error: El UID del usuario no está definido',
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
        return; // Termina la ejecución del método
      }
  
      let path = `t_diagnosticos/${this.userId}/t_diagnosticos`; // Define el path para el documento del diagnóstico en Firebase
      
      console.log('Path de la incidencia:', path); // Muestra el path en consola
  
      const loading = await this.utilService.loading(); // Muestra un indicador de carga
      await loading.present(); // Presenta el indicador de carga
  
      let dataUrl = this.form.value.cn_id_img; // Obtiene el valor de la imagen seleccionada
      let imgPath = `${this.userId}/${Date.now()}`; // Define un path único para la imagen
      let imgUrl = await this.firebaseService.updateImg(imgPath, dataUrl); // Sube la imagen a Firebase y obtiene la URL
   
      this.form.controls.cn_id_img.setValue(imgUrl); // Asigna la URL de la imagen al control correspondiente
      //delete this.form.value.cn_id_incidencia; // Elimina el id y toma el uid creado
    
      this.firebaseService
        .addDocument(path, this.form.value) // Agrega el documento del diagnóstico a Firebase
        .then(async (resp) => {
          this.utilService.dismissModal({ success: true }); // Cierra el modal automáticamente
  
            await this.firebaseService.bitacoraGeneral('Incidencias asignadas',this.incidencia, this.userId, 'Diagnostico de incidencia');
         
            await this.firebaseService.bitacoraCambioEstado(
              this.incidencia,
              String(this.userId),
              3,
              2
            );
            
            await this.firebaseService.actualizaTabla(
              '/t_incidencias/',
              this.incidencia['id'],
              String(this.incidencia['cn_id_usuario']),
              { cn_id_estado: 3 }
            );


          // Mensaje de éxito al guardar los datos
          this.utilService.presentToast({
            message: 'Diagnostico agregado de manera exitosa',
            duration: 1500,
            color: 'primary',
            position: 'bottom',
            icon: 'checkmark-circle-outline',
          });
        })
        // Mensaje de error al guardar los datos
        .catch((error) => {
          console.error('Error al agregar el diagnostico:', error); // Muestra el error en consola
          this.utilService.presentToast({ // Muestra un mensaje de error
            message: error.message,
            duration: 2500,
            color: 'danger',
            position: 'bottom',
            icon: 'alert-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss(); // Oculta el indicador de carga
        });
    }

  // Método para obtener las fotos
  async takeImage() {
    const dataUrl = (
      await this.utilService.takePicture('Foto para el diagnostico')
    ).dataUrl; // Obtiene la URL de la imagen seleccionada
    this.form.controls.cn_id_img.setValue(dataUrl); // Asigna la URL de la imagen al control correspondiente
  }
}