import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { RegistrarUsuarioComponent } from 'src/app/shared/components/registrar-usuario/registrar-usuario.component';

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.page.html',
  styleUrls: ['./registrar-usuario.page.scss'],
})
export class RegistrarUsuarioPage implements OnInit {

  constructor() { }

  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);
  form: any;

  ngOnInit() {
  }


    //para editar incidente
    async addUpdateIncident(user?: User){
  
      let modal = await this.utilService.getModal({
        component: RegistrarUsuarioComponent,
        cssClass: 'add-update-modal',
        componentProps: {user}
      })
      
        // para que cargue automaticamente los incidentes agregados
        // if(modal) this.getIncidencias();
    }  
}
