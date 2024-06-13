import { Component, OnInit, inject } from '@angular/core';
import { map } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {

  utilService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  loading: boolean = false;
  usuarios : User[] = [];


  ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.getUsuarios();

  }

    // Método para refrescar la pantalla
    doRefresh(event : any){

      setTimeout(() => {
        this.getUsuarios();
        event.target.complete();
      }, 1000)
    }

    // Método para obtener la lista de incidencias reportadas
    getUsuarios(){
  
      let path;
      this.firebaseService.getCurrentUser().subscribe(user => {
        if (user) {
  
          path = `t_usuarios/`;//ruta de la incidencia
          
          this.loading = true;
  
          let sub = this.firebaseService.getCollectionDataUsuarios(path)
          .snapshotChanges().pipe(
            map(changes => changes.map( c => ({
              id: c.payload.doc.id,
              ...c.payload.doc.data()
            })))
          ).subscribe({
            next: (resp: any) => {
              this.usuarios = resp;
              this.loading = false;
              sub.unsubscribe();
            }
          })
        }
      });
    }
}
