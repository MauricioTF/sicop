import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IncidenciasReportadasCompletaComponent } from './incidencias-reportadas-completa.component';

describe('IncidenciasReportadasCompletaComponent', () => {
  let component: IncidenciasReportadasCompletaComponent;
  let fixture: ComponentFixture<IncidenciasReportadasCompletaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IncidenciasReportadasCompletaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IncidenciasReportadasCompletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
