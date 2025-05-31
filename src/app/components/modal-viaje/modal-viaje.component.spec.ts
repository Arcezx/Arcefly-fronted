import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViajeComponent } from './modal-viaje.component';

describe('ModalViajeComponent', () => {
  let component: ModalViajeComponent;
  let fixture: ComponentFixture<ModalViajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalViajeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalViajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
