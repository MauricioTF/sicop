// Importación de módulos y servicios necesarios
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ActualizarIncidenciaComponent } from 'src/app/shared/components/actualizar-incidencia/actualizar-incidencia.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { map } from 'rxjs';

// Decorador de Componente que define metadatos para el componente
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  // Inyección de servicios y definición de variables
  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  userId: string | null = null;

  loading: boolean = false;
  incidencia : Incidencia[] = [];

  specificRole: any;
  roles: any;
  id_rol_usuario : any;
  
  tecnico: boolean = false;
  usuario: boolean = false;
  encargado: boolean = false;

  rolesArray: number[] = [];
  cdr = inject(ChangeDetectorRef);

    // Método que se ejecuta al inicializar el componente
  async ngOnInit() {

  this.specificRole = await this.firebaseService.getSpecificRole(String(this.user().cn_id_usuario)); // Llama a getSpecificRole con el cn_id_rol deseado y espera el resultado

  for (let i = 0; i < this.specificRole.length; i++) {
    this.rolesArray.push(this.specificRole[i].cn_id_rol)
  }

  this.tecnico = this.rolesArray.includes(4);
  this.usuario = this.rolesArray.includes(2);
  this.encargado = this.rolesArray.includes(3);

  this.cdr.detectChanges(); // Forzar la detección de cambios
}

  // Método que se ejecuta cuando la vista está a punto de entrar y volverse la vista activa
  ionViewWillEnter(){
    
    this.getIncidencias();
  }

  // Método para agregar un incidente
  async addUpdateIncident(incidencia?: Incidencia){

    let modal = await this.utilService.getModal({
      component: ActualizarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {incidencia}
      
    })
    
    await this.firebaseService.bitacoraGeneral('Mis incidencias', incidencia, this.userId, 'Registro de incidencia');

      // para que cargue automaticamente los incidentes agregados
      if(modal) this.getIncidencias();
  }  

  // Método para obtener los datos del usuario del almacenamiento local
  user(): User {
    return this.utilService.getLocalStorage('user');
  }

  // Método para obtener la lista de incidencias reportadas
  getIncidencias(){
  
    let path;
    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        const userPath = `t_usuarios/${this.userId}`; // Asegúrate de que el path sea correcto según tu estructura de datos

        path = `t_incidencias/${this.userId}/t_incidencias`;//ruta de la incidencia
        
        this.loading = true;

        let sub = this.firebaseService.getCollectionDataIncidencia(path)
        .snapshotChanges().pipe(
          map(changes => changes.map( c => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data()
          })))
        ).subscribe({
          next: (resp: any) => {
            this.incidencia = resp;
            this.loading = false;
            sub.unsubscribe();
          }
        })
        this.firebaseService.getDocument(userPath).then(userData => {
          
          // Si necesitas otros datos del usuario, puedes manejarlos aquí
        }).catch(error => {
          console.error('Error obteniendo datos de usuario:', error);
        });
      }
    });
  }

  // Método para refrescar la pantalla
  doRefresh(event : any){

    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000)
  }

}
