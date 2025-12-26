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
import { PersonalDialogComponent } from '../personal-dialog/personal-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-personal-list',
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
  templateUrl: './personal-list.html',
  styleUrls: ['./personal-list.css'],
})
export class PersonalList {
  totalItems: number = 0;
  pageSize: number = 16;
  page: number = 0;

  constructor(private personalService: PersonalService, private dialog: MatDialog) {}

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'legajo',
    'nombre',
    'apellido',
    'dni',
    'especialidad',
    'rol',
    'estado',
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
    this.personalService.getPersonal(page, pageSize).subscribe((response: any) => {
      // Adaptar a la nueva estructura de paginación
      const content = response?.data?.content || [];
      const totalItems = response?.data?.totalElements || 0;
      const pageNumber = response?.data?.number || page;
      const pageSizeResp = response?.data?.size || pageSize;

      this.dataSource.data = content;
      this.totalItems = totalItems;
      this.pageSize = pageSizeResp;
      this.page = pageNumber;
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
      data: IPersonal || {},
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadPage(this.page, this.pageSize);
      }
    });
  }
}
