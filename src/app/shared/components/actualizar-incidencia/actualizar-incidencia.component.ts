// Importación de módulos y servicios necesarios
import { Component, OnInit, inject } from '@angular/core'; // Importa Component, OnInit para el ciclo de vida del componente, e inject para inyectar servicios
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Importa AngularFirestore para interactuar con Firestore
import { FormControl, FormGroup, Validators } from '@angular/forms'; // Importa clases para manejar formularios reactivos
import { Incidencia } from 'src/app/models/incidencia.model'; // Importa el modelo Incidencia
import { User } from 'src/app/models/user.model'; // Importa el modelo User
import { FirebaseService } from 'src/app/services/firebase.service'; // Importa FirebaseService para interactuar con Firebase
import { UtilsService } from 'src/app/services/utils.service'; // Importa UtilsService para funciones de utilidad

// Decorador Component que define la configuración del componente
@Component({
  selector: 'app-actualizar-incidencia', // Selector CSS para usar el componente
  templateUrl: './actualizar-incidencia.component.html', // Ubicación del archivo de plantilla del componente
  styleUrls: ['./actualizar-incidencia.component.scss'], // Ubicación de los estilos específicos del componente
})
export class ActualizarIncidenciaComponent implements OnInit { // Define la clase del componente
  // Inyección de servicios y definición de variables
  firebaseService = inject(FirebaseService); // Inyecta FirebaseService
  utilService = inject(UtilsService); // Inyecta UtilsService
  firestore = inject(AngularFirestore); // Inyecta AngularFirestore

  counterDoc = this.firestore.collection('counters').doc('idCounter'); // Referencia a un documento específico en Firestore

  // Usuario
  t_usuarios = {} as User; // Define una variable para el usuario con el tipo User
  // Incidencia
  t_incidencia = {} as Incidencia; // Define una variable para la incidencia con el tipo Incidencia
  userId: string | null = null; // Define una variable para almacenar el ID del usuario

  specificRole: any; // Define una variable para almacenar el rol específico
  usuarios: any; // Define una variable para almacenar los usuarios
  asignacion: any; // Define una variable para almacenar la asignación
  year: string; // Define una variable para almacenar el año

  // Definición del formulario
  form = new FormGroup({ // Crea un nuevo grupo de controles para el formulario
    cn_id_usuario: new FormControl(null), // Control para el ID del usuario
    cn_id_estado: new FormControl(0), // Control para el estado
    cn_tecnicos: new FormControl(0), // Control para los técnicos
    cn_id_afectacion: new FormControl(''), // Control para la afectación
    cf_fecha_hora: new FormControl(null), // Control para la fecha y hora
    cn_id_riesgo: new FormControl(''), // Control para el riesgo
    cn_id_prioridad: new FormControl(''), // Control para la prioridad
    cn_id_categoria: new FormControl(''), // Control para la categoría
    ct_id_img: new FormControl('', [Validators.required]), // Control para la imagen con validación requerida
    ct_titulo: new FormControl('', [Validators.required]), // Control para el título con validación requerida
    ct_descripcion: new FormControl('', [Validators.required]), // Control para la descripción con validación requerida
    ct_lugar: new FormControl('', [Validators.required]), // Control para el lugar con validación requerida
    ct_justificacion_cierre: new FormControl(''), // Control para la justificación de cierre
    cn_monto: new FormControl(null), // Control para el monto
  });

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    this.firebaseService.getCurrentUser().subscribe((user) => { // Obtiene el usuario actual
      if (user) { // Si hay un usuario
        this.userId = user.uid; // Asigna el UID del usuario
        const userPath = `t_usuarios/${this.userId}`; // Define el path del usuario en Firestore

        this.firebaseService
          .getDocument(userPath) // Obtiene el documento del usuario
          .then((userData) => { // En caso de éxito
            this.form.controls.cn_id_usuario.setValue(this.userId); // Asigna el ID del usuario al formulario
          })
          .catch((error) => { // En caso de error
            console.error('Error obteniendo datos de usuario:', error); // Muestra el error en consola
          });
      }
    });
  }

  // Método que se ejecuta al enviar el formulario
  async submit() {
    //otorga hora de CR
    this.form.controls.cf_fecha_hora.setValue(
      new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }) // Asigna la fecha y hora actual
    );
    this.form.controls.cn_id_estado.setValue(1); // Asigna el estado

    this.crearIncidencia(); // Llama al método para crear la incidencia
  }

  // Método para crear la incidencia
  async crearIncidencia() {
    if (!this.userId) { // Si no hay un ID de usuario
      console.error('El UID del usuario no está definido'); // Muestra el error en consola
      this.utilService.presentToast({ // Muestra un mensaje de error
        message: 'Error: El UID del usuario no está definido',
        duration: 2500,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
      return; // Termina la ejecución del método
    }

    // let path = `t_incidencias/${this.userId}/t_incidencias`;
    let path = `t_incidencias/${this.userId}/t_incidencias`; // Define el path de la incidencia en Firestore

    const loading = await this.utilService.loading(); // Muestra un indicador de carga
    await loading.present(); // Presenta el indicador de carga

    try {
      const customId = await this.idIncidencia(); // Obtiene un ID personalizado para la incidencia
      // Actualizar la URL de la imagen
      let dataUrl = this.form.value.ct_id_img; // Obtiene el valor de la imagen del formulario
      let imgPath = `${this.userId}/${Date.now()}`; // Define un path único para la imagen
      let imgUrl = await this.firebaseService.updateImg(imgPath, dataUrl); // Actualiza la imagen en Firebase y obtiene la URL

      this.form.controls.ct_id_img.setValue(imgUrl); // Asigna la URL de la imagen al formulario

      await this.firestore.doc(`${path}/${customId}`).set(this.form.value); // Crea la incidencia en Firestore

      this.utilService.dismissModal({ success: true }); // Cierra el modal automáticamente

      this.sendEmail(); // Llama al método para enviar un correo electrónico

      // Mensaje de éxito al guardar los datos
      this.utilService.presentToast({
        message: 'Incidencia agregada de manera exitosa',
        duration: 1500,
        color: 'primary',
        position: 'bottom',
        icon: 'checkmark-circle-outline',
      });
    } catch (error) { // En caso de error
      console.error('Error al agregar la incidencia:', error); // Muestra el error en consola
      this.utilService.presentToast({ // Muestra un mensaje de error
        message: 'Error al agregar la incidencia',
        duration: 2500,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss(); // Oculta el indicador de carga
    }
  }

  // Método para obtener las fotos
  async takeImage() {
    const dataUrl = (
      await this.utilService.takePicture('Foto de la incidencia')
    ).dataUrl; // Obtiene la URL de la imagen
    this.form.controls.ct_id_img.setValue(dataUrl); // Asigna la URL de la imagen al formulario
  }

  // Método para obtener los técnicos
  getTecnicos(): Promise<any> {
    return new Promise((resolve, reject) => { // Crea una nueva promesa
      this.firebaseService.getTecnicos().subscribe(
        (data) => { // En caso de éxito
          const tecnicos = data; // Obtiene los técnicos
          resolve(tecnicos); // Resuelve la promesa con los técnicos
          console.log('Todos los usuarios ', tecnicos); // Muestra los técnicos en consola
        },
        (error) => { // En caso de error
          console.error('Error al obtener roles:', error); // Muestra el error en consola
          reject(error); // Rechaza la promesa
        }
      );
    });
  }

  // Método para obtener los roles de los usuarios
  async sendEmail() {
    this.usuarios = await this.getTecnicos(); // Obtiene los roles registrados

    let u_tecnios = []; // Define un arreglo para los técnicos

    // recorro los tecnicos para acceder a sus id
    for (let i = 0; i < this.usuarios.length; i++) {
      // asignamos a specific rol el rol con cada usuario
      this.specificRole = await this.firebaseService.getSpecificRole(
        this.usuarios[i].cn_id_usuario
      ); // Obtiene el rol específico de cada usuario

      // recorremos a los roles de cada usuario
      for (let j = 0; j < this.specificRole.length; j++) {
        // consultamos si el usuario tiene rol de encargado
        if (this.specificRole[j].cn_id_rol === 3) { // Si el rol es de encargado
          this.firebaseService
            .sendEmail(
              this.usuarios[i].ct_correo,
              'Nueva incidencia reportada',
              'Hola!! ' +
                this.usuarios[i].ct_nombre +
                ' se ha reportado una nueva incidencia, por favor revisarla y asignarla a un tecnico si aún no lo has hecho.'
            ) // Envía un correo electrónico
            .subscribe(
              (response) => {}, // En caso de éxito
              (error) => {} // En caso de error
            );
          // agregamos al arreglo el id del usuario con rol de tenico
          u_tecnios.push(this.usuarios[i]); // Agrega el usuario al arreglo de técnicos
        }
      }
    }

    return u_tecnios; // Devuelve el arreglo de técnicos
  }

  // Método para obtener el siguiente ID personalizado
  private async idIncidencia(): Promise<string> {
    this.year = new Date().getFullYear().toString(); // Obtiene el año actual

    const counterDoc = this.firestore.doc(`counters/${this.year}`); // Referencia al documento del contador
    const counterSnapshot = await counterDoc.get().toPromise(); // Obtiene el documento

    let newCounter = 1; // Valor inicial del contador

    if (counterSnapshot.exists) { // Si el documento existe
      const counterData = counterSnapshot.data() as { count: number }; // Obtiene los datos del contador
      newCounter = counterData.count + 1; // Incrementa el contador
    }

    const paddedCounter = String(newCounter).padStart(5, '0'); // Rellena el contador con ceros
    const customId = `${this.year}-${paddedCounter}`; // Crea el ID personalizado

    // Actualiza el contador en Firestore
    await counterDoc.set({ count: newCounter }, { merge: true }); // Actualiza el documento del contador

    return customId; // Devuelve el ID personalizado
  }
}