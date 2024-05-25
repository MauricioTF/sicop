import { Component, OnInit, inject } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ActualizarIncidenciaComponent } from 'src/app/shared/components/actualizar-incidencia/actualizar-incidencia.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { Incidencia } from 'src/app/models/incidencia.model';
import { map } from 'rxjs';
import { Diagnostico } from 'src/app/models/diagnostico.model';
import { DiagnosticoIncidenciaComponent } from 'src/app/shared/components/diagnostico-incidencia/diagnostico-incidencia.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  userId: string | null = null;

  loading: boolean = false;
  incidencia : Incidencia[] = [];
  form: any;

  ngOnInit() {

    // this.getIncidencias()
  }

  //para mostrar los incidente pero no tener que recargar
  ionViewWillEnter(){
    this.getIncidencias();
  }


  //para editar incidente
  async addUpdateIncident(incidencia?: Incidencia){

    console.log(incidencia);

    let modal = await this.utilService.getModal({
      component: ActualizarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {incidencia}
    })
    
      // para que cargue automaticamente los incidentes agregados
      if(modal) this.getIncidencias();
  }  

  async addDiagnostico(diagnostico?: Diagnostico, incidencia?: Incidencia){

    console.log(incidencia['id']);

    let modal = await this.utilService.getModal({
      component: DiagnosticoIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {diagnostico, incidencia}
    })
    
      // para que cargue automaticamente los incidentes agregados
      if(modal) this.getIncidencias();

  }
  //retorna datos del usuario en el local storage
  user(): User {
    return this.utilService.getLocalStorage('t_usuarios');
  }

  //llama coleccion de datos (lista de incidencias reportadas)
  getIncidencias(){
  
    let path;
    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        const userPath = `t_usuarios/${this.userId}`; // Asegúrate de que el path sea correcto según tu estructura de datos

        path = `t_incidencias/${this.userId}/t_incidencias`;//ruta de la incidencia
        
        this.loading = true;

        let sub = this.firebaseService.getCollectionData(path)
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
          console.error('Error getting user data:', error);
        });
      }
    });
  }

  // Para refrescar pantalla
  doRefresh(event : any){

    setTimeout(() => {
      this.getIncidencias();
      event.target.complete();
    }, 1000)
  }

  
}
