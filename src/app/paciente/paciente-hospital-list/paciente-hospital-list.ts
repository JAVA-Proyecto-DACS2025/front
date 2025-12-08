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

interface Paciente {
  id: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  edad: number;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
}

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
  dataSource = new MatTableDataSource<Paciente>([]);
  page = 0;
  pageSize = 16;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize);
  }

  loadPage(page: number, pageSize: number) {
    // TODO: reemplaza con llamada a tu servicio
    this.pacienteService.getPacientesExternos(pageSize).subscribe((data) => {
      this.dataSource.data = data;
      this.totalItems = data.length;
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
  agregarPaciente(_t113: any) {
    
  }
}
