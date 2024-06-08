
// Importación de módulos y servicios necesarios
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ActualizarIncidenciaComponent } from 'src/app/shared/components/actualizar-incidencia/actualizar-incidencia.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { map } from 'rxjs';
import { Diagnostico } from 'src/app/models/diagnostico.model';


import { Location } from '@angular/common'; // Importa Location

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);
  location = inject(Location); // Inyecta Location
  loading: boolean = false;
  diagnostico : Diagnostico[] = [];

  ngOnInit() {
  }

    // Método que se ejecuta cuando la vista está a punto de entrar y volverse la vista activa
    ionViewWillEnter(){
    
      this.getDiagnosticos();
    }
  
    // Método para obtener los datos del usuario del almacenamiento local
    user(): User {
      return this.utilService.getLocalStorage('user');
    }
    
    // Método para obtener la lista de incidencias reportadas
    getDiagnosticos(){
  
      let path;
      this.firebaseService.getCurrentUser().subscribe(user => {
        if (user) {

          const userPath = `t_usuarios/${user.uid}`; // Asegúrate de que el path sea correcto según tu estructura de datos
  
          path = `t_diagnosticos/${user.uid}/t_diagnosticos`;//ruta del diagnostico

          this.loading = true;
  
          let sub = this.firebaseService.getCollectionDataDiagnosticos(path)
          .snapshotChanges().pipe(
            map(changes => changes.map( c => ({
              id: c.payload.doc.id,
              ...c.payload.doc.data()
            })))
          ).subscribe({
            next: (resp: any) => {
              this.diagnostico = resp;
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
      this.getDiagnosticos();
      event.target.complete();
    }, 1000)
  }
}
