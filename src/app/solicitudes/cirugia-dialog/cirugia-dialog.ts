import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PersonalService } from '../../core/services/personal-service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { ICirugia } from '../../core/models/cirugia';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CirugiaService } from '../../core/services/cirugia-service';
import { MatOption } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  startWith,
  map,
} from 'rxjs/operators';
import { PacienteService } from '../../core/services/paciente'; // ajusta la ruta si hace falta
import { IPaciente } from '../../core/models/paciente'; // ajusta la ruta si hace falta
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Helpers } from '../../core/utils/helpers';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  standalone: true,
  selector: 'app-cirugia-dialog',
  templateUrl: './cirugia-dialog.html',
  styleUrls: ['./cirugia-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    
  ],
})
export class CirugiaDialog {
  public form: FormGroup;
  // almacenar inicialmente el objeto paciente o null para evitar "undefined" en el display
  public pacienteCtrl = new FormControl<IPaciente | string | null>(null);
  public filteredPacientes$: Observable<IPaciente[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService,
    private cirugiaService: CirugiaService,
    private pacienteService: PacienteService,
    private dialogRef: MatDialogRef<CirugiaDialog>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ICirugia
  ) {
    this.form = this.fb.group({
      id: [null],
      pacienteId: [null],
      pacienteNombre: [''],
      quirofanoNombre: [''],
      quirofanoId: [null],
      servicio: [''],
      // fecha como Date y hora como string "HH:MM"
      fecha_inicio: [null],
      hora_inicio: [''],
      estado: [''],
      prioridad: [''],
      anestesia: [''],
      tipo: [''],
    });
  }

  ngOnInit() {
    this.initPacienteAutocomplete();
    if (this.data) {
      this.form.patchValue(this.buildPatch(this.data));
      this.pacienteCtrl.setValue(this.data.paciente ?? null, { emitEvent: false });
    }
  }

  // Inicializa el autocompletado de pacientes
  private initPacienteAutocomplete(): void {
    this.filteredPacientes$ = this.pacienteCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const q = typeof value === 'string' ? value.trim() : '';
        return q ? this.pacienteService.searchPacientes(q).pipe(catchError(() => of([]))) : of([]);
      })
    );
  }
  // Construye un objeto parcheado para inicializar el formulario
  private buildPatch(data: any): any {
    const patch: any = {
      ...data,
      pacienteId: data.paciente?.id ?? null,
      quirofanoId: data.quirofano?.id ?? null,
    };

    if (data.fecha_hora_inicio) {
      const d = new Date(data.fecha_hora_inicio);
      if (!isNaN(d.getTime())) {
        patch.fecha_inicio = d;
        patch.hora_inicio = `${String(d.getHours()).padStart(2, '0')}:${String(
          d.getMinutes()
        ).padStart(2, '0')}`;
      }
    }

    return patch;
  }

  // acepta IPaciente | string | null para evitar mostrar "undefined"
  displayPaciente(value: IPaciente | string | null): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return `${value.nombre}${value.dni ? ' - ' + value.dni : ''}`;
  }

  onPacienteSelected(event: MatAutocompleteSelectedEvent) {
    const paciente: IPaciente = event.option.value;
    this.form.patchValue({
      pacienteId: paciente?.id ?? null,
      pacienteNombre:
        paciente?.nombre ??
        (typeof this.pacienteCtrl.value === 'string' ? this.pacienteCtrl.value : ''),
    });
  }

  guardar() {
    if (!this.form.valid) {
      return;
    }
    const cirugiaData = this.form.value;
    if (cirugiaData.id) {
      this.updateCirugia(cirugiaData);
    } else {
      this.createCirugia(cirugiaData);
    }
  }

  private createCirugia(cirugiaData: ICirugia) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar creación',
        message: '¿Estás seguro de que deseas crear esta cirugía?',
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const payload = Helpers.buildCirugiaPayload(cirugiaData);
      console.log('Payload a enviar para crear cirugía:', payload);
      this.cirugiaService.createCirugia(payload).subscribe(
        (resp: any) => {
          const payload = resp && resp.data ? resp.data : resp;
          this.dialogRef.close(payload);
        },
        (err) => {
          console.error('Error creando cirugía', err);
        }
      );
    });
  }

  private updateCirugia(cirugiaData: ICirugia) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar actualización',
        message: '¿Estás seguro de que deseas actualizar esta cirugía?',
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const payload = Helpers.buildCirugiaPayload(cirugiaData);
      this.cirugiaService.updateCirugia(payload).subscribe(
        (resp: any) => {
          const payload = resp && resp.data ? resp.data : resp;
          this.dialogRef.close(payload);
        },
        (err) => {
          console.error('Error actualizando cirugía', err);
        }
      );
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  /** Getter para usar en el HTML */
  get isEditMode(): boolean {
    return !!this.form.value.id;
  }
}
