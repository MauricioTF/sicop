import { Component, OnInit, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { map } from 'rxjs';
import { Asignaciones } from 'src/app/models/asignaciones.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-incidencias-terminadas',
  templateUrl: './incidencias-terminadas.page.html',
  styleUrls: ['./incidencias-terminadas.page.scss'],
})
export class IncidenciasTerminadasPage implements OnInit {


    // Inyección de servicios y definición de variables
    utilService = inject(UtilsService);
    firebaseService = inject(FirebaseService);
    alertController = inject(AlertController);

    loading: boolean = false;
    incidencia: Incidencia[] = [];
    idUsuarios: any;
    
    asignaciones: Asignaciones[] = [];

  ngOnInit() {
  }

      // Método que se ejecuta cuando la vista está a punto de entrar y volverse la vista activa
      ionViewWillEnter(){
    
        this.getIncidencias();
    }  
  
    // Método para obtener los datos del usuario del almacenamiento local
    getIdUsuarior(): Promise<any> {
      return new Promise((resolve, reject) => {
        this.firebaseService.getTecnicos().subscribe(
          (data) => {
            const usuarios = data;
            resolve(usuarios);
          },
          (error) => {
            console.error('Error al obtener roles:', error);
            reject(error); // Rechaza la promesa en caso de error
          }
        );
      });
    }
  
    // Método para refrescar la pantalla
    doRefresh(event : any){
  
      setTimeout(() => {
        this.getIncidencias();
        event.target.complete();
      }, 1000)
    }
  
  // Método para obtener la lista de incidencias reportadas
  async getIncidencias() {
    this.idUsuarios = await this.getIdUsuarior();
    this.incidencia = []; // Asegúrate de inicializar la lista de incidencias
  
    this.firebaseService.getCurrentUser().subscribe((user) => {
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
              )
            )
            .subscribe({
              next: (resp: any) => {
                
                allIncidencias = [...allIncidencias, ...resp]; // Agregar incidencias a la lista acumulada
                processedUsers++;
  
                // Verificar si todos los usuarios han sido procesados
                if (processedUsers === this.idUsuarios.length) {
                  
                  for (let i = 0; i < allIncidencias.length; i++) {   
                    //si la incidencia no está terminada               
                    if (allIncidencias[i].cn_id_estado === 4) {  
                      this.incidencia.push(allIncidencias[i]);
                      
                    }
                  }
  
                  this.loading = false;
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;
  
                // Asegúrate de manejar el estado de carga incluso si hay errores
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
                }
              }
            });
  
          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
              // Manejar otros datos del usuario aquí si es necesario
            })
            .catch((error) => {
              console.error('Error obteniendo datos de usuario:', error);
            });
        }
      }
    });
  }

  // async fianlizarIncidencia(incidencia: Incidencia) {
  //   await this.firebaseService.actualizaTabla(incidencia['id'], String(incidencia['cn_id_usuario']), { cn_id_estado: 5 });

  // }

   // Método para mostrar la alerta de confirmación
   async fianlizarIncidencia(incidencia: Incidencia) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea finalizar la incidencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'Aceptar',
          handler: async () => {
            console.log('Acción confirmada');
            await this.firebaseService.actualizaTabla(incidencia['id'], String(incidencia['cn_id_usuario']), { cn_id_estado: 5 });
            this.utilService.presentToast({
              message: "La incidencia ha sido finalizada exitosamente",
              duration: 2500,
              color: 'success',
              position: 'bottom',
              icon: 'checkmark-circle-outline'
            });
            this.getIncidencias();
            // Llama a la función para realizar la acción aquí
          },
        },
      ],
    });

    await alert.present();
  }

  async rechazarIncidencia(incidencia: Incidencia) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea rechazar la incidencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'Aceptar',
          handler: async () => {

            await this.firebaseService.actualizaTabla(incidencia['id'], String(incidencia['cn_id_usuario']), { cn_id_estado: 8 });

            this.getIncidenciasAsignadas(incidencia);

            this.utilService.presentToast({
              message: "La incidencia ha sido rechazada exitosamente",
              duration: 2500,
              color: 'success',
              position: 'bottom',
              icon: 'checkmark-circle-outline'
            });
            this.getIncidencias();
            // Llama a la función para realizar la acción aquí
          },
        },
      ],
    });

    await alert.present();
  }

  // obtiene todos los diagnosticos para saber cual es el del usuario que terminó la incidencia
  async getIncidenciasAsignadas(incidencia: Incidencia) {

    this.idUsuarios = await this.getIdUsuarios();
    this.asignaciones = []; 

    this.incidencia = [];

    this.firebaseService.getCurrentUser().subscribe((user) => {
      if (user) {
        let allAsignacion = []; // Lista para acumular todas las incidencias
        let allA = []; // Lista para acumular todas las incidencias

        let processedUsers = 0; // Contador para usuarios procesados
        this.loading = true;

        for (let i = 0; i < this.idUsuarios.length; i++) {
          const userPath = `t_usuarios/${this.idUsuarios[i].cn_id_usuario}`; // Ruta del usuario
          const path = `t_asignacion_incidencia/${this.idUsuarios[i].cn_id_usuario}/t_asignacion_incidencia`; // Ruta de la incidencia

          this.loading = true;

          this.firebaseService
            .getCollectionDataIncidenciasAsignadas(path)
            .snapshotChanges()
            .pipe(
              map((changes) =>
                changes.map((c) => ({
                  id: c.payload.doc.id,
                  ...c.payload.doc.data(),
                }))
              )
            )
            .subscribe({
              next: async (resp: any) => {
                allA = [...allA, ...resp]; // Agregar incidencias a la lista acumulada
                processedUsers++;
                // Verificar si todos los usuarios han sido procesados
                if (processedUsers === this.idUsuarios.length) {

                  this.asignaciones =  allA;

                  for (let i = 0; i < this.asignaciones.length; i++) {
                    if(this.asignaciones[i].cn_id_incidencia === incidencia['id']
                      && this.asignaciones[i].cn_id_usuario === String(incidencia['cn_id_usuario'])
                    ){
                      console.log("aaaaaaa ",this.asignaciones[i]['id']);
                      await this.firebaseService.eliminaRegistro(this.asignaciones[i]['id'], String(incidencia['cn_id_usuario']));
                    }
                    
                  }        
                }
              },
              error: (error) => {
                console.error('Error obteniendo incidencias:', error);
                processedUsers++;

                // Asegúrate de manejar el estado de carga incluso si hay errores
                if (processedUsers === this.idUsuarios.length) {
                  this.loading = false;
                }
              },
            });
          this.firebaseService
            .getDocument(userPath)
            .then((userData) => {
              // Manejar otros datos del usuario aquí si es necesario
            })
            .catch((error) => {
              console.error('Error obteniendo datos de usuario:', error);
            });
        }
      }
    });
  }

    // Método para obtener los datos del usuario del almacenamiento local
    getIdUsuarios(): Promise<any> {
      return new Promise((resolve, reject) => {
        this.firebaseService.getTecnicos().subscribe(
          (data) => {
            const usuarios = data;
            resolve(usuarios);
          },
          (error) => {
            console.error('Error al obtener roles:', error);
            reject(error); // Rechaza la promesa en caso de error
          }
        );
      });
    }

}
