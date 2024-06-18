import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciasTerminadasPage } from './incidencias-terminadas.page';

describe('IncidenciasTerminadasPage', () => {
  let component: IncidenciasTerminadasPage;
  let fixture: ComponentFixture<IncidenciasTerminadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenciasTerminadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
