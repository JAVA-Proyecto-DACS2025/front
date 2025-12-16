import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionTurnos } from './seleccion-turnos';

describe('SeleccionTurnos', () => {
  let component: SeleccionTurnos;
  let fixture: ComponentFixture<SeleccionTurnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionTurnos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionTurnos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
