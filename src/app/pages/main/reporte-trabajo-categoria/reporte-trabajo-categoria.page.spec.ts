import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteTrabajoCategoriaPage } from './reporte-trabajo-categoria.page';

describe('ReporteTrabajoCategoriaPage', () => {
  let component: ReporteTrabajoCategoriaPage;
  let fixture: ComponentFixture<ReporteTrabajoCategoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteTrabajoCategoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
