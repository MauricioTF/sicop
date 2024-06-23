import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteCargaTrabajoPage } from './reporte-carga-trabajo.page';

describe('ReporteCargaTrabajoPage', () => {
  let component: ReporteCargaTrabajoPage;
  let fixture: ComponentFixture<ReporteCargaTrabajoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteCargaTrabajoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
