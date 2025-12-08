import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteHospitalList } from './paciente-hospital-list';

describe('PacienteHospitalList', () => {
  let component: PacienteHospitalList;
  let fixture: ComponentFixture<PacienteHospitalList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteHospitalList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteHospitalList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
