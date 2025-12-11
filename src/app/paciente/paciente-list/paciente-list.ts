import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PersonalService } from '../../core/services/personal-service';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { PersonalDialogComponent } from '../../personal/personal-dialog/personal-dialog';
import { PacienteHospitalListComponent } from '../paciente-hospital-list/paciente-hospital-list';
import { PacienteService } from '../../core/services/paciente';
import { IPaciente } from '../../core/models/paciente';
import { PacienteDialog } from '../paciente-dialog/paciente-dialog';

@Component({
  selector: 'app-paciente-list',
  imports: [
    MatIcon,
    MatFormField,
    MatLabel,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './paciente-list.html',
  styleUrls: ['./paciente-list.css'],
})
export class PacienteList {
  totalItems: number = 0;
  pageSize: number = 16;
  page: number = 0;

  constructor(private pacienteService: PacienteService, private dialog: MatDialog) {}

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'nombre',
    'apellido',
    'dni',
    'fecha_nacimiento',
    'altura',
    'peso',
    'direccion',
    'telefono',
    'editar',
    'eliminar',
  ];

  ngOnInit() {
    this.loadPage(this.page, this.pageSize);
  }

  // llamado desde (page) del mat-paginator
  onPage(event: PageEvent) {
    const nextPage = event.pageIndex ?? 0;
    const nextSize = event.pageSize ?? this.pageSize;

    // mostrar inmediatamente la elección del usuario en el UI
    this.page = nextPage;
    this.pageSize = nextSize;

    // recargar datos desde el backend con los nuevos parámetros
    this.loadPage(nextPage, nextSize);
  }

  loadPage(page: number, pageSize: number) {
    this.pacienteService.getPacientes(page, pageSize).subscribe((response) => {
      this.dataSource.data = response.data;
      this.totalItems = response.pagination.totalItems; // <-- usar pagination
      this.pageSize = response.pagination.pageSize;
      this.page = response.pagination.page;
    });
  }

  applyFilter(arg0: any) {
    throw new Error('Method not implemented.');
  }

  deletePersonal(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      data: { title: 'Eliminar paciente', message: '¿Confirma eliminar este registro?' },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.pacienteService.deletePaciente(id).subscribe(() => {
          this.loadPage(this.page, this.pageSize);
        });
      }
    });
  }

  openPaciente(IPaciente?: any) {
    // pasar el componente como primer parámetro y los datos en `data`
    const dialogRef = this.dialog.open(PacienteDialog, {
      width: '400px',
      data: IPaciente || {},
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadPage(this.page, this.pageSize);
      }
    });
  }

  openPersonalHospitalList() {
    const dialogref = this.dialog.open(PacienteHospitalListComponent, {});
    dialogref.afterClosed().subscribe(() => {
      this.loadPage(this.page, this.pageSize);
    });
  }
}
