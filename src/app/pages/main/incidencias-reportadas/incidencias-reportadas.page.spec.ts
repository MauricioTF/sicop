import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciasReportadasPage } from './incidencias-reportadas.page';

describe('IncidenciasReportadasPage', () => {
  let component: IncidenciasReportadasPage;
  let fixture: ComponentFixture<IncidenciasReportadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenciasReportadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
