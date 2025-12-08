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

  constructor(private personalService: PersonalService, private dialog: MatDialog) {}

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'legajo',
    'nombre',
    'dni',
    'especialidad',
    'rol',
    'estado',
    'telefono',
    'editar',
    'eliminar',
  ]; //Agregar matricula (No todos estos son medicos)??

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
    this.personalService.getPersonal(page, pageSize).subscribe((response: any) => {
      this.dataSource.data = response.data;
      this.totalItems = response.total;
      this.pageSize = response.pageSize;
      this.page = response.page;
    });
  }

  applyFilter(arg0: any) {
    throw new Error('Method not implemented.');
  }

  deletePersonal(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      data: { title: 'Eliminar personal', message: '¿Confirma eliminar este registro?' },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.personalService.deletePersonal(id).subscribe(() => {
          this.loadPage(this.page, this.pageSize);
        });
      }
    });
  }

  openPersonal(IPersonal?: any) {
    // pasar el componente como primer parámetro y los datos en `data`
    const dialogRef = this.dialog.open(PersonalDialogComponent, {
      width: '400px',
      data: IPersonal || {},
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
      // acciones si es necesario al cerrar el diálogo
    });
  }
}
