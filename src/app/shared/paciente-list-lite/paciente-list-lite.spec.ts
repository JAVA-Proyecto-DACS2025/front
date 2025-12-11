import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteListLite } from './paciente-list-lite';

describe('PacienteListLite', () => {
  let component: PacienteListLite;
  let fixture: ComponentFixture<PacienteListLite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteListLite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteListLite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
