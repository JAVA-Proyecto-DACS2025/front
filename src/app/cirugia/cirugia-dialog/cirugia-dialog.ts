import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ICirugia } from '../../core/models/cirugia';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { CirugiaService } from '../../core/services/cirugia.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { IPacienteLite } from '../../core/models/paciente'; // ajusta la ruta si hace falta
import { Helpers } from '../../core/utils/helpers';
import { PacienteListLite } from '../../shared/paciente-list-lite/paciente-list-lite';
import { QuirofanoService } from '../../core/services/quirofano.service';
import { IQuirofano } from '../../core/models/quirofano';
import { SeleccionTurnos } from '../seleccion-turnos/seleccion-turnos';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
})
export class CirugiaDialog {
  @ViewChild('servicioSelect') servicioSelect!: MatSelect;
  @ViewChild('quirofanoSelect') quirofanoSelect!: MatSelect;

  public form: FormGroup;
  public pacienteCtrl = new FormControl<string>('');
  public quirofanos: IQuirofano[] = [];
  public servicios: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cirugiaService: CirugiaService,
    private quirofanoService: QuirofanoService,
    private dialogRef: MatDialogRef<CirugiaDialog>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ICirugia
  ) {
    this.form = this.fb.group({
      id: [null],
      pacienteId: [null],
      pacienteNombre: [''],
      quirofanoId: [null],
      quirofanoNombre: [''],
      servicioId: [null],
      servicioNombre: [''],
      // fecha como Date y hora como string "HH:MM"
      fechaInicio: [null],
      horaInicio: [''],
      estado: [''],
      prioridad: [''],
      anestesia: [''],
      tipo: [''],
    });
  }

  ngOnInit() {
    if (this.data) {
      const patchData = this.buildPatch(this.data);
      this.form.patchValue(patchData);
      this.pacienteCtrl.setValue(
        this.formatPacienteDisplay({
          nombre: (this.data as any)?.pacienteNombre,
          dni: (this.data as any)?.dni,
        })
      );
    } else {
      // En modo creación, cargar quirófanos y servicios automáticamente
      this.onQuirofanoOpened();
      this.openSeleccionServicios();
    }
    
    // Escuchar cambios en servicioId para limpiar fecha y hora
    this.form.get('servicioId')?.valueChanges.subscribe(() => {
      this.form.patchValue({
        fechaInicio: null,
        horaInicio: ''
      });
    });
  }

  // Construye un objeto parcheado para inicializar el formulario
  private buildPatch(data: any): any {
    const patch: any = {
      ...data,
    };
    console.log('🔵 buildPatch data:', data);

    // Guardar el nombre del servicio para mostrarlo sin necesidad de cargar la lista
    if (data.servicio) {
      patch.servicioNombre = data.servicio;
    }

    // Guardar el nombre del quirófano para mostrarlo sin necesidad de cargar la lista
    if (data.quirofano) {
      patch.quirofanoNombre = data.quirofano;
    }

    // Formatear horaInicio a HH:MM hs si viene en otro formato
    if (data.horaInicio) {
      const timeStr = String(data.horaInicio);
      // Si tiene formato HH:MM:SS, extraer solo HH:MM
      const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        const hh = match[1].padStart(2, '0');
        const mm = match[2];
        patch.horaInicio = `${hh}:${mm} HS`;
      } else if (!timeStr.includes('HS')) {
        patch.horaInicio = `${timeStr} HS`;
      }
    }

    // Formatear fechaInicio a dd/MM/yyyy si viene como Date
    if (data.fechaInicio && data.fechaInicio instanceof Date) {
      const dd = data.fechaInicio.getDate().toString().padStart(2, '0');
      const mm = (data.fechaInicio.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = data.fechaInicio.getFullYear();
      patch.fechaInicio = `${dd}/${mm}/${yyyy}`;
    }

    return patch;
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

  openPacienteListDialog() {
    const ref = this.dialog.open(PacienteListLite, {
      width: '900px',
      maxHeight: '90vh',
    });

    ref.afterClosed().subscribe((paciente?: IPacienteLite) => {
      if (!paciente) return;
      this.pacienteCtrl.setValue(this.formatPacienteDisplay(paciente));
      this.form.patchValue({
        pacienteId: paciente?.id ?? null,
        pacienteNombre: this.formatPacienteNombre(paciente),
      });
    });
  }

  onQuirofanoOpened() {
    if (this.quirofanos.length > 0) {
      return;
    }
    this.quirofanoService.getQuirofanos().subscribe((resp: any) => {
      // Adaptar a la estructura de IApiResponse con data como array
      const data = resp?.data ?? resp ?? [];
      this.quirofanos = Array.isArray(data) ? data : [];
    });
  }

  switchToSelectAndLoad() {
    // Cargar servicios y luego abrir el select
    this.openSeleccionServicios();
    // Esperar un tick para que se renderice el select y luego abrirlo
    setTimeout(() => {
      if (this.servicioSelect) {
        this.servicioSelect.open();
      }
    }, 100);
  }

  switchToSelectAndLoadQuirofano() {
    // Cargar quirófanos y luego abrir el select
    this.onQuirofanoOpened();
    // Esperar un tick para que se renderice el select y luego abrirlo
    setTimeout(() => {
      if (this.quirofanoSelect) {
        this.quirofanoSelect.open();
      }
    }, 100);
  }

  openSeleccionServicios() {
    if (this.servicios.length > 0) {
      return;
    }

    this.cirugiaService.getServicios().subscribe((resp: any) => {
      // Asegurar que siempre sea un array
      const data = resp?.data ?? resp ?? [];
      this.servicios = Array.isArray(data) ? data : [];
    });
  }

  openSeleccionTurnos() {
    const servicioId = this.form.get('servicioId')?.value;
    const ref = this.dialog.open(SeleccionTurnos, {
      width: '960px',
      maxHeight: '90vh',
      data: {
        days: 7,
        startHour: '08:00',
        endHour: '17:30',
        intervalMinutes: 30,
        servicioId: servicioId || 0,
        quirofanos: this.quirofanos,
      },
    });

    ref.afterClosed().subscribe((result?: { date: Date; time: string }) => {
      if (!result) return;
      const dd = result.date.getDate().toString().padStart(2, '0');
      const mm = (result.date.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = result.date.getFullYear();
      const fechaFormateada = `${dd}/${mm}/${yyyy}`;

      this.form.patchValue({
        fechaInicio: fechaFormateada,
        horaInicio: `${result.time} HS`,
      });
    });
  }

  private formatPacienteDisplay(
    paciente: Partial<IPacienteLite & { apellido?: string; dni?: string }>
  ): string {
    const nombre = paciente?.nombre ?? '';
    const apellido = (paciente as any)?.apellido ?? '';
    const dni = (paciente as any)?.dni ?? '';
    return [nombre, apellido, dni ? `(${dni})` : ''].filter(Boolean).join(' ').trim();
  }

  private formatPacienteNombre(paciente: Partial<IPacienteLite & { apellido?: string }>): string {
    const nombre = paciente?.nombre ?? '';
    const apellido = (paciente as any)?.apellido ?? '';
    return [nombre, apellido].filter(Boolean).join(' ').trim();
  }

  /** Getter para usar en el HTML */
  get isEditMode(): boolean {
    return !!this.form.value.id;
  }
}
