import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipoMedicoDialog } from './equipo-medico-dialog';



describe('EquipoMedicoDialog', () => {
  let component: EquipoMedicoDialog;
  let fixture: ComponentFixture<EquipoMedicoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoMedicoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipoMedicoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
