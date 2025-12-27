import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { IPacienteExterno } from '../../core/models/paciente-externo';
import { PacienteService } from '../../core/services/paciente.service';

@Component({
  selector: 'app-paciente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './paciente-dialog.html',
  styleUrls: ['./paciente-dialog.css'],
})
export class PacienteDialog implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PacienteDialog>,
    private pacienteService: PacienteService,
    @Inject(MAT_DIALOG_DATA) public data: IPacienteExterno | null
  ) {
    this.form = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      peso: [''],
      altura: [''],
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  guardar(): void {
    if (this.form.valid) {
      this.pacienteService.createPaciente(this.form.value).subscribe({
        next: (nuevoPaciente) => {
          this.dialogRef.close(nuevoPaciente);
        },
      });
    }
  }
}
