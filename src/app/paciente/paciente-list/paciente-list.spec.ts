import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteList } from './paciente-list';

describe('PacienteList', () => {
  let component: PacienteList;
  let fixture: ComponentFixture<PacienteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
