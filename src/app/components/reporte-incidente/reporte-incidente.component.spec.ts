import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteIncidenteComponent } from './reporte-incidente.component';

describe('ReporteIncidenteComponent', () => {
  let component: ReporteIncidenteComponent;
  let fixture: ComponentFixture<ReporteIncidenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteIncidenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteIncidenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
