import { Component, Inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PersonalService } from '../../core/services/personal-service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { IPersonal } from '../../core/models/personal';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  standalone: true,
  selector: 'app-personal-dialog',
  templateUrl: './personal-dialog.html',
  styleUrls: ['./personal-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule, // required for formControlName
    MatFormFieldModule, // provides mat-form-field
    MatInputModule, // provides matInput
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
  ],
})
export class PersonalDialogComponent {
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService,
    private dialogRef: MatDialogRef<PersonalDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: IPersonal
  ) {
    this.form = this.fb.group({
      id: [null],
      nombre: [''],
      dni: [''],
      legajo: [''],
      especialidad: [''],
      rol: [''],
      estado: [''],
      telefono: [''],
    });
  }

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  guardar() {
    if (!this.form.valid) {} else {
      const personalData = this.form.value;
      if (personalData.id) {
        // Actualizar personal existente
        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Confirmar actualización',
            message: '¿Estás seguro de que deseas actualizar este personal?',
          },
        });

        confirmDialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.personalService.updatePersonal(personalData).subscribe((response) => {
              this.dialogRef.close(response);
            });
          }
        });
      } else {
        // Crear nuevo personal
        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Confirmar creación',
            message: '¿Estás seguro de que deseas crear este personal?',
          },
        });

        confirmDialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.personalService.createPersonal(personalData).subscribe((response) => { 
              this.dialogRef.close(response);
            });
          }
        });
      }
    }
  }
  cancelar() {
    this.dialogRef.close();
  } 
}
