import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';

@Component({
  selector: 'app-reporte-carga-trabajo',
  templateUrl: './reporte-carga-trabajo.page.html',
  styleUrls: ['./reporte-carga-trabajo.page.scss'],
})
export class ReporteCargaTrabajoPage implements OnInit {

  openI = true;
  openF= false;

  ngOnInit() {
  }

  dateForm: FormGroup;
  minDate: string;
  maxDate: string;

  constructor(private fb: FormBuilder) {
    const today = new Date();

    // Fecha mínima: hoy
    this.minDate = today.toISOString();

    // Fecha máxima: 31 de diciembre de 2099
    const maxYear = new Date(today.setFullYear(today.getFullYear() + 75));
    this.maxDate = maxYear.toISOString();

    // Formulario Reactivo
    this.dateForm = this.fb.group({
      startDate: [this.minDate], // Inicializa con la fecha de hoy
      endDate: [this.minDate]    // Inicializa con la fecha de hoy
    });
  }

  validateDates() {
    const startDate = this.dateForm.get('startDate').value;
    const endDate = this.dateForm.get('endDate').value;

    // Verifica que las fechas sean válidas
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.dateForm.get('endDate').setValue('');
      alert('La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    // Actualiza minDate para endDate
    if (startDate) {
      this.minDate = new Date(startDate).toISOString();
    }

    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
  }

  openFechaInicio(){
    this.openI = !this.openI;
    this.openF = false;
  }
  openFechaFin(){
    this.openF = !this.openF;
    this.openI = false;

  }

}
