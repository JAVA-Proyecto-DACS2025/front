import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteDialog } from './paciente-dialog';

describe('PacienteDialog', () => {
  let component: PacienteDialog;
  let fixture: ComponentFixture<PacienteDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
