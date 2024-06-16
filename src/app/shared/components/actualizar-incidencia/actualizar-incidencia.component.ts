// Importación de módulos y servicios necesarios
import { Component, OnInit, inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Incidencia } from 'src/app/models/incidencia.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import firebase from 'firebase/compat';
import { UtilsService } from 'src/app/services/utils.service';
import { Observable, catchError, from, map, switchMap } from 'rxjs';
// Decorador Component que define la configuración del componente
@Component({
  selector: 'app-actualizar-incidencia',
  templateUrl: './actualizar-incidencia.component.html',
  styleUrls: ['./actualizar-incidencia.component.scss'],
})
export class ActualizarIncidenciaComponent implements OnInit {

    // Inyección de servicios y definición de variables
  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);
  firestore = inject(AngularFirestore);

  counterDoc = this.firestore.collection('counters').doc('idCounter');

  // Usuario
  t_usuarios = {} as User;
  // Incidencia
  t_incidencia = {} as Incidencia;
  userId: string | null = null;

  
  specificRole: any;
  usuarios: any;
  asignacion: any;
  year: string;

    // Definición del formulario
  form = new FormGroup({
    cn_id_incidencia: new FormControl(1),
    cn_id_usuario: new FormControl(null),
    cn_id_estado: new FormControl(null),
    cn_id_afectacion: new FormControl(null),
    cf_fecha_hora: new FormControl(null),
    cn_id_riesgo: new FormControl(null),
    cn_id_prioridad: new FormControl(null),
    cn_id_categoria: new FormControl(null),
    ct_id_img: new FormControl('', [Validators.required]),
    ct_titulo: new FormControl('', [Validators.required]),
    ct_descripcion: new FormControl('', [Validators.required]),
    ct_lugar: new FormControl('', [Validators.required]),
    ct_justificacion_cierre: new FormControl(''),
    cn_monto: new FormControl(null),
    cn_numero_incidente: new FormControl(null),
  });

    // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        const userPath = `t_usuarios/${this.userId}`; // Asegúrate de que el path sea correcto según tu estructura de datos

        this.firebaseService.getDocument(userPath).then(userData => {
          this.form.controls.cn_id_usuario.setValue(this.userId);

        }).catch(error => {
          console.error('Error obteniendo datos de usuario:', error);
        });
      }
    });
  }

    // Método que se ejecuta al enviar el formulario
  async submit() {

    //otorga hora de CR
    this.form.controls.cf_fecha_hora.setValue(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    this.form.controls.cn_id_estado.setValue(1);

    this.crearIncidencia();
  }
  
  // Método para crear la incidencia
 async crearIncidencia() {
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

  // let path = `t_incidencias/${this.userId}/t_incidencias`;
  let path = `t_incidencias/${this.userId}/t_incidencias`;

  const loading = await this.utilService.loading();
  await loading.present();

  try {
 
    const customId = await this.idIncidencia();
    // Actualizar la URL de la imagen
    let dataUrl = this.form.value.ct_id_img; // Valor de la imagen seleccionada
    let imgPath = `${this.userId}/${Date.now()}`; // Path único para la imagen
    let imgUrl = await this.firebaseService.updateImg(imgPath, dataUrl);

    this.form.controls.ct_id_img.setValue(imgUrl);
    
    await this.firestore.doc(`${path}/${customId}`).set(this.form.value);

    this.utilService.dismissModal({ success: true }); // Para cerrar el modal automáticamente

    // Mensaje de éxito al guardar los datos
    this.utilService.presentToast({
      message: 'Incidencia agregada de manera exitosa',
      duration: 1500,
      color: 'primary',
      position: 'bottom',
      icon: 'checkmark-circle-outline',
    });
  } catch (error) {
    console.error('Error al agregar la incidencia:', error);
    this.utilService.presentToast({
      message: 'Error al agregar la incidencia',
      duration: 2500,
      color: 'danger',
      position: 'bottom',
      icon: 'alert-circle-outline',
    });
  } finally {
    loading.dismiss();
  }
}

  // Método para obtener las fotos
  async takeImage() {
    const dataUrl = (
      await this.utilService.takePicture('Foto de la incidencia')
    ).dataUrl; // Extrae la respuesta que se selecciona
    this.form.controls.ct_id_img.setValue(dataUrl);
  }

    // Método para obtener los técnicos
    getTecnicos(): Promise<any> {
      return new Promise((resolve, reject) => {
        this.firebaseService.getTecnicos().subscribe(
          data => {
            const tecnicos = data;
           resolve(tecnicos);
            console.log("Todos los usuarios ",tecnicos);
          },
          error => {
            console.error('Error al obtener roles:', error);
            reject(error); // Rechaza la promesa en caso de error
          }
        );
      });
    }
    
      // Método para obtener los roles de los usuarios
    async sendEmail(){
    
      this.usuarios = await this.getTecnicos();//obtiene los roles registrados
    
      let u_tecnios = [];
      
    
      // recorro los tecnicos para acceder a sus id
      for (let i = 0; i < this.usuarios.length; i++) {
    
        // asignamos a specific rol el rol con cada usuario
        this.specificRole = await this.firebaseService.getSpecificRole(this.usuarios[i].cn_id_usuario); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado
    
      // recorremos a los roles de cada usuario
      for (let j = 0; j < this.specificRole.length; j++) {
    
        // consultamos si el usuario tiene rol de tecnico
        if(this.specificRole[j].cn_id_rol === 3){
          
          console.log("Usuario con rol de tecnico ",this.usuarios[i].ct_correo);
          this.firebaseService.sendEmail(this.usuarios[i].ct_correo, "Nueva incidencia reportada", "Hola!! "+this.usuarios[i].ct_nombre+" se ha reportado una nueva incidencia, por favor revisarla y asignarla a un tecnico si aún no lo has hecho.")
    .subscribe(
      response => {

      },
      error => {

      }
    );
          // agregamos al arreglo el id del usuario con rol de tenico
          u_tecnios.push(this.usuarios[i]);
        }
    
      }
    
    }
        
       return u_tecnios;
    }


    // ////////////////////////////////////// generar el uid
  // Método para obtener el siguiente ID personalizado
  private async idIncidencia(): Promise<string> {
    
    this.year = new Date().getFullYear().toString();

    const counterDoc = this.firestore.doc(`counters/${this.year}`);
    const counterSnapshot = await counterDoc.get().toPromise();

    let newCounter = 1; // Valor inicial si no existe el contador

    if (counterSnapshot.exists) {
      const counterData = counterSnapshot.data() as { count: number };
      newCounter = counterData.count + 1;
    }

    const paddedCounter = String(newCounter).padStart(5, '0'); // Relleno con ceros
    const customId = `${this.year}-${paddedCounter}`;

    // Actualiza el contador en Firestore
    await counterDoc.set({ count: newCounter }, { merge: true });

    return customId;
  }
  // ////////////////////////////////////////////////////////////
}

function subscribe(arg0: (response: any) => void, arg1: (error: any) => void) {
  throw new Error('Function not implemented.');
}

