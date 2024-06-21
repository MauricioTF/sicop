import { Component, OnInit } from '@angular/core';
import { Incidencia } from 'src/app/models/incidencia.model';

@Component({
  selector: 'app-incidencias-reportadas-completa',
  templateUrl: './incidencias-reportadas-completa.component.html',
  styleUrls: ['./incidencias-reportadas-completa.component.scss'],
})
export class IncidenciasReportadasCompletaComponent  implements OnInit {

  incidencia = {} as Incidencia;
  // incidencia: Incidencia[] = [];

  constructor() { }

  ngOnInit() {}

  
}
