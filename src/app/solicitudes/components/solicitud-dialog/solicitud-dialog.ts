import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-solicitud-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,      // <- asegurarse que está aquí
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './solicitud-dialog.html',
  styleUrls: ['./solicitud-dialog.css']
})

export class SolicitudDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SolicitudDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      paciente: ['', Validators.required],
      tipo: [''],
      medico: [''],
      fecha: [''],
      observaciones: ['']
    });

    if (data) this.form.patchValue(data);
  }

  cancelar() { this.dialogRef.close(null); }
  guardar() {
    if (this.form.valid) this.dialogRef.close(this.form.value);
  }
}