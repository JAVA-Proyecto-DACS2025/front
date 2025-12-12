import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { ICirugia } from '../../core/models/cirugia';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { CirugiaService } from '../../core/services/cirugia-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { IPacienteLite } from '../../core/models/paciente'; // ajusta la ruta si hace falta
import { Helpers } from '../../core/utils/helpers';
import { PacienteListLite } from '../../shared/paciente-list-lite/paciente-list-lite';

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
    
  ],
})
export class CirugiaDialog {
  public form: FormGroup;
  // almacenar inicialmente el objeto paciente o null para evitar "undefined" en el display
  public pacienteCtrl = new FormControl<string>('');

  constructor(
    private fb: FormBuilder,
    private cirugiaService: CirugiaService,
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
      this.form.patchValue(this.buildPatch(this.data));
      // mostrar en el input el label del paciente existente, si viene en los datos
      this.pacienteCtrl.setValue(
        this.formatPacienteDisplay({ nombre: (this.data as any)?.paciente, dni: (this.data as any)?.dni })
      );
    }
  }
  // Construye un objeto parcheado para inicializar el formulario
  private buildPatch(data: any): any {
    const patch: any = {
      ...data,
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
      maxHeight: '90vh'
    });

    ref.afterClosed().subscribe((paciente?: IPacienteLite) => {
      if (!paciente) return;
      this.pacienteCtrl.setValue(this.formatPacienteDisplay(paciente));
      this.form.patchValue({
        pacienteId: paciente?.id ?? null,
        pacienteNombre: this.formatPacienteNombre(paciente)
      });
    });
  }

  private formatPacienteDisplay(paciente: Partial<IPacienteLite & { apellido?: string; dni?: string }>): string {
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
