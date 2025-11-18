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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SolicitudDialogComponent } from '../solicitud-dialog/solicitud-dialog';
import pacientes from './pacientes.json';

export interface Solicitud {
  id: number;
  fecha?: string;
  paciente: string;
  prioridad: string;
  servicio: string;
  sala?: string;
  especialidad?: string;
  intervencion?: string;
  anestesia?: string;
  cirujano?: string;
  estado?: string;
  quirofano?: string;
}

const DATA: Solicitud[] = (pacientes as any as Solicitud[]).map((p, idx) => ({
  // asegúrate de que el JSON tenga las mismas propiedades; rellenar id si falta
  id: p.id ?? (idx + 1),
  fecha: p.fecha,
  paciente: p.paciente ?? p.paciente ?? 'Desconocido',
  prioridad: p.prioridad ?? 'Media',
  servicio: p.servicio ?? '',
  sala: p.sala,
  especialidad: p.especialidad,
  intervencion: p.intervencion,
  anestesia: p.anestesia,
  cirujano: p.cirujano,
  estado: p.estado,
  quirofano: p.quirofano
}));


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
    MatDialogModule,
  ],
})
export class SolicitudesListComponent implements AfterViewInit {
  displayedColumns: string[] = ['fecha', 'paciente', 'prioridad', 'servicio', 'sala', 'especialidad', 'intervencion', 'anestesia', 'cirujano', 'estado', 'quirofano', 'acciones'];
  dataSource = new MatTableDataSource<Solicitud>(DATA);

  constructor(private dialog: MatDialog) {}

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

  crearSolicitud() {
    const ref = this.dialog.open(SolicitudDialogComponent, {
      width: '480px',
      data: {}, // puedes pasar datos para editar
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        // result contiene el objeto del formulario -> guarda en backend/actualiza datasource
        console.log('Nueva solicitud:', result);
        // ejemplo: this.dataSource.data = [result, ...this.dataSource.data];
      }
    });
  }
}
