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
import { ICirugiaResponse, ICirugiaRequest } from '../../../core/models/cirugia';
import { Helpers } from '../../../core';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

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
    MatListModule,
    MatTabsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './solicitud-dialog.html',
  styleUrls: ['./solicitud-dialog.css'],
})
export class SolicitudDialogComponent {
  form: FormGroup;
  pacienteCtrl = new FormControl('');    //MODIFICAR A FormGroup
  quirofanoCtrl = new FormControl('');
  pacienteOptions$: Observable<{ dni: string; nombre: string }[]> = of([]);    //MODIFICAR
  private search$ = new Subject<string>();
  equipo: any; // ????

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private cirugiaService: CirugiaService,
    private dialogRef: MatDialogRef<SolicitudDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICirugiaResponse
  ) {
    this.form = this.fb.group({
      paciente: this.pacienteCtrl,
      pacienteId: [null],
      quirofano: this.quirofanoCtrl,
      quirofanoId: [null],
      servicio: [''],
      fecha_hora_inicio: [],
      hora: [null], // "HH:mm
      estado: [''],
      prioridad: [''],
      anestesia: [''],
      tipo: [''],
    });

    this.pacienteOptions$ = this.pacienteCtrl.valueChanges.pipe(
      startWith(this.pacienteCtrl.value ?? ''),
      debounceTime(300),
      distinctUntilChanged((a: any, b: any) => {
        const sa = typeof a === 'string' ? a : ((a as any)?.nombre ?? '');
        const sb = typeof b === 'string' ? b : ((b as any)?.nombre ?? '');
        return sa === sb;
      }),
      filter(v => typeof v === 'string' && v.trim().length > 0),
      switchMap(q => this.pacienteService.searchPacientes(q)),
      catchError(() => of([])),
      shareReplay(1)
    );

    // detectar selección/entrada en el control quirofano y rellenar quirofanoId
    this.quirofanoCtrl.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(v => {
      // si el control recibe un objeto { id, nombre } (por autocomplete), usar id
      if (v && typeof v === 'object' && (v as any).id != null) {
        this.form.patchValue({ quirofanoId: (v as any).id });
        return;
      }
      // si el usuario ingresó un número (id) como string/number, usarlo
      const asStr = typeof v === 'string' ? v.trim() : (v == null ? '' : String(v));
      if (/^\d+$/.test(asStr)) {
        this.form.patchValue({ quirofanoId: Number(asStr) });
        return;
      }
      // no válido → limpiar quirofanoId
      this.form.patchValue({ quirofanoId: null });
    });

    if (data) {
      const mapped = this.mapDataToForm(data);
      this.form.patchValue(mapped);
    }
  }

  displayPaciente = (u?: { dni: string; nombre: string }) => (u ? `${u.dni}  -  ${u.nombre}` : '');

  // opcional si necesitas detectar selección explicitamente
  onPacienteSelected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value as { dni: string; nombre: string; id: number };

    // setear objeto para display y guardar el id para enviar
    this.pacienteCtrl.setValue(user.nombre);
    this.form.patchValue({ paciente: user, pacienteId: user.id });

    // obtener la sala actual de la forma / control / data (en ese orden) sin asumir this.data
    const formQuirofano = this.form.get('quirofano')?.value;
    const ctrlQuirofano = this.quirofanoCtrl.value;
    const dataQuirofano = (this.data as any)?.quirofano;
    const qDisplay = formQuirofano ?? ctrlQuirofano ?? (dataQuirofano ? (typeof dataQuirofano === 'object' ? (dataQuirofano.nombre ?? dataQuirofano.id) : dataQuirofano) : null);

    if (qDisplay != null) {
      this.quirofanoCtrl.setValue(qDisplay);
      // si existe id en data.quirofano, setear quirofanoId; si no, mantener lo que haya en el form
      const qId = (dataQuirofano && (dataQuirofano.id ?? null)) ?? this.form.get('quirofanoId')?.value ?? null;
      if (qId != null) this.form.patchValue({ quirofanoId: qId });
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  guardar() {
    if (!this.form.valid) return;
    const raw = this.form.value;
    const fechaSql = Helpers.toSqlTimestamp(raw.fecha_hora_inicio, raw.hora);
    const fechaIso = fechaSql ? fechaSql.replace(' ', 'T') : '';
    const payload: ICirugiaRequest = {
      anestesia: raw.anestesia,
      estado: raw.estado,
      prioridad: raw.prioridad,
      servicio: raw.servicio,
      tipo: raw.tipo,
      fecha_hora_inicio: fechaIso,
      pacienteId: raw.pacienteId,
      quirofanoId: raw.quirofanoId,
    };
    this.cirugiaService.saveCirugia(payload).subscribe(() => this.dialogRef.close(payload));
  }

  openEquipoSelector() {
    throw new Error('Method not implemented.');
  }

  removeMiembro(_t135: any) {
    throw new Error('Method not implemented.');
  }

  // mapper: convierte ICirugiaResponse en objeto listo para patchValue
  private mapDataToForm(data: ICirugiaResponse): any {
    const mapped: any = { ...data };

    // paciente (display + objeto)
    if (data.paciente) {
      this.pacienteCtrl.setValue(data.paciente.nombre); // muestra nombre en autocomplete
      mapped.paciente = data.paciente;
      mapped.pacienteId = data.paciente.id ?? (mapped.pacienteId ?? null);
    }

    // quirofano: mostramos solo el nombre (quirofano) y guardamos el id en quirofanoId
    if ((data as any).quirofano) {
      const q = (data as any).quirofano;
      const qDisplay = typeof q === 'object' ? q.nombre : q;
      this.quirofanoCtrl.setValue(qDisplay); // muestra solo nombre
      mapped.quirofano = qDisplay;
      mapped.quirofanoId = (q && (q.id ?? q)) ?? (mapped.quirofanoId ?? null);
    } else if ((data as any).quirofanoId != null) {
      // si viene solo el id
      // opcional: podrías resolver el nombre aquí desde un servicio si lo necesitas
      this.quirofanoCtrl.setValue((data as any).quirofanoId);
      mapped.quirofano = (data as any).quirofanoId;
      mapped.quirofanoId = (data as any).quirofanoId;
    }

    // fecha_hora_inicio ISO -> date + hora ("HH:mm")
    if (data.fecha_hora_inicio) {
      const dt = new Date(data.fecha_hora_inicio);
      if (!isNaN(dt.getTime())) {
        mapped.fecha_hora_inicio = dt;
        const pad = (n: number) => String(n).padStart(2, '0');
        mapped.hora = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      }
    }

    return mapped;
  }
}
