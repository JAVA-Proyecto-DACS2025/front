import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PacienteService } from '../../core/services/paciente';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PacienteDialog } from '../paciente-dialog/paciente-dialog';
import { IPacienteExterno } from '../../core/models/paciente-externo';
import { IApiResponse } from '../../core/models/api-response';

@Component({
  selector: 'app-paciente-hospital-list',
  standalone: true,
  templateUrl: './paciente-hospital-list.html',
  styleUrls: ['./paciente-hospital-list.css'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class PacienteHospitalListComponent implements OnInit {
  displayedColumns = [
    'nombre',
    'apellido',
    'dni',
    'edad',
    'fecha_nacimiento',
    'direccion',
    'telefono',
    'accionAgregar',
  ];
  dataSource = new MatTableDataSource<IPacienteExterno>([]);
  page = 0;
  pageSize = 10;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private pacienteService: PacienteService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<PacienteHospitalListComponent>
  ) {}

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize);
  }

  loadPage(page: number, pageSize: number) {
    this.pacienteService.getPacientesExternos(pageSize).subscribe((data) => {
      this.dataSource.data = data.data;
      this.totalItems = data.data.length;
      this.page = page;
      this.pageSize = pageSize;
    });
    
    if (this.paginator) {
      this.paginator.pageIndex = this.page;
      this.paginator.pageSize = this.pageSize;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  onPage(event: PageEvent) {
    this.loadPage(event.pageIndex, event.pageSize);
  }

  applyFilter(filter: string) {
    this.dataSource.filter = filter.trim().toLowerCase();
    if (this.paginator) this.paginator.firstPage();
  }

  refresh() {
    this.loadPage(this.page, this.pageSize);
  }

  // Abrir el dialog de agregar paciente
  agregarPaciente(data: any) {
    const dialogref = this.dialog.open(PacienteDialog, {width: '400px', data: data});
    dialogref.afterClosed().subscribe((result: any) => {
      if (result) {
        // Cerrar el dialog padre con true para indicar que se guardó un paciente
        this.dialogRef.close(true);
      }
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}
