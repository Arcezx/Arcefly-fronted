import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaViajesComponent } from './tabla-viajes.component';

describe('TablaViajesComponent', () => {
  let component: TablaViajesComponent;
  let fixture: ComponentFixture<TablaViajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaViajesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaViajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
