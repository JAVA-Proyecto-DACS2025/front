import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  filter,
  startWith,
  shareReplay,
} from 'rxjs/operators';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PacienteService } from '../../../core/services/paciente';
import { CirugiaService } from '../../../core/services/cirugia-service';
import { ICirugia } from '../../../core/models/cirugia';
import { Helpers } from '../../../core';


@Component({
  standalone: true,
  selector: 'app-solicitud-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './solicitud-dialog.html',
  styleUrls: ['./solicitud-dialog.css'],
})
export class SolicitudDialogComponent {
  form: FormGroup;
  pacienteCtrl = new FormControl('');
  pacienteOptions$: Observable<{ dni: string; nombre: string; id?: number }[]> = of([]);
  private search$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private cirugiaService: CirugiaService,
    private dialogRef: MatDialogRef<SolicitudDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICirugia
  ) {
    this.form = this.fb.group({
      pacienteId: this.pacienteCtrl,
      servicio: [''],
      fecha_hora_inicio: [''],
      hora: [null], // "HH:mm
      estado: [''],
      prioridad: [''],
      quirofanoId: [null],
      anestesia: [''],
      tipo: [''],
    });

    // Solo realiza la petición cuando se emite en search$ (ej: al presionar Enter)
    this.pacienteOptions$ = this.search$.pipe(
      switchMap((q) => this.pacienteService.searchPacientes(q)),
      catchError(() => of([])),
      shareReplay(1)
    );

    if (data) this.form.patchValue(data);
  }

  // Llamar desde la plantilla al presionar Enter
  searchPacientesFromInput(): void {
    const v = this.pacienteCtrl.value;
    if (typeof v === 'string' && v.trim().length > 0) {
      this.search$.next(v.trim());
    }
  }

  displayPaciente = (u?: { dni: string; nombre: string }) => (u ? `${u.dni}  -  ${u.nombre}` : '');

  // opcional si necesitas detectar selección explicitamente
  onPacienteSelected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value as { dni: string; nombre: string; id: number };
    this.form.patchValue({ pacienteId: user });
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  guardar() {
    if (!this.form.valid) return;
    const raw = this.form.value;
    const fechaSql = Helpers.toSqlTimestamp(raw.fecha_hora_inicio, raw.hora);
    const fechaIso = fechaSql ? fechaSql.replace(' ', 'T') : null;
    const payload = {
      ...raw,
      fecha_hora_inicio: fechaIso,
      pacienteId: extractPacienteId(raw),
    };
    this.cirugiaService.saveCirugia(payload).subscribe(() => this.dialogRef.close(payload));
  }
}

function extractPacienteId(raw: any) {
  const p = raw.pacienteId;
  return p && typeof p === 'object' ? p.id : p ?? null;
}
