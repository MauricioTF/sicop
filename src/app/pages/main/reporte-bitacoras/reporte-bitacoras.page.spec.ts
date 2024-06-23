import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteBitacorasPage } from './reporte-bitacoras.page';

describe('ReporteBitacorasPage', () => {
  let component: ReporteBitacorasPage;
  let fixture: ComponentFixture<ReporteBitacorasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteBitacorasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
