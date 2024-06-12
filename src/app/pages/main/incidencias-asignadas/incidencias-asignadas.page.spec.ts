import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciasAsignadasPage } from './incidencias-asignadas.page';

describe('IncidenciasAsignadasPage', () => {
  let component: IncidenciasAsignadasPage;
  let fixture: ComponentFixture<IncidenciasAsignadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenciasAsignadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
