import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';


export interface Solicitud {
  id: number;
  paciente: string;
  tipo: string;
  medico: string;
  fecha: string;
  estado: string;
}

const DATA: Solicitud[] = [
  { id: 1, paciente: 'Juan Pérez', tipo: 'Consulta', medico: 'Dr. Díaz', fecha: '2025-11-01', estado: 'Pendiente' },
  { id: 2, paciente: 'María Gómez', tipo: 'Turno', medico: 'Dra. Ruiz', fecha: '2025-11-02', estado: 'Atendida' },
  // ...más datos
];

@Component({
  selector: 'app-solicitudes-list',
  templateUrl: './solicitudes-list.html',
  styleUrls: ['./solicitudes-list.css'],
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
  ]
})
export class SolicitudesListComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'paciente', 'tipo', 'medico', 'fecha', 'estado', 'actions'];
  dataSource = new MatTableDataSource<Solicitud>(DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  verDetalle(row: Solicitud) {
    // abrir dialog o expandir fila con detalle
    console.log('ver detalle', row);
  }
}