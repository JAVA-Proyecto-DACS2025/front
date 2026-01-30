import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService, IKeycloakUserCreate } from '../../core/services/usuario.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-dialog.css'
})
export class UsuarioDialogComponent {
  form: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  roles = [
    { value: 'admin', label: 'Administrador', icon: 'admin_panel_settings' },
    { value: 'personal_medico', label: 'Personal Médico', icon: 'medical_services' },
  ];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      enabled: [true],
      emailVerified: [false],
      temporaryPassword: [false],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar creación',
        message: '¿Estás seguro de que deseas crear este usuario?',
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.crearUsuario();
      }
    });
  }

  private crearUsuario() {
    this.isLoading = true;
    const formValue = this.form.value;

    const userData: IKeycloakUserCreate = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      enabled: formValue.enabled,
      emailVerified: formValue.emailVerified,
      credentials: [{
        type: 'password',
        value: formValue.password,
        temporary: formValue.temporaryPassword,
      }],
      roles: [formValue.role],
    };

    this.usuarioService.createUsuario(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
