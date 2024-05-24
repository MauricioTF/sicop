import { Component, OnInit, inject } from '@angular/core';
import {Incidencia} from '../../../models/incidencia.model'
import { UtilsService } from 'src/app/services/utils.service';
import { ActualizarIncidenciaComponent } from 'src/app/shared/components/actualizar-incidencia/actualizar-incidencia.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  utilService = inject(UtilsService);

  ngOnInit() {
  }

  //para editar incidente
  async addUpdateIncident(incidencia?: Incidencia){

    let modal = await this.utilService.getModal({
      component: ActualizarIncidenciaComponent,
      cssClass: 'add-update-modal',
      componentProps: {incidencia}
    })
    
  }
}
