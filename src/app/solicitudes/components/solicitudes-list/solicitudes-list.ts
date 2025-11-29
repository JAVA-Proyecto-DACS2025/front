import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SolicitudDialogComponent } from '../solicitud-dialog/solicitud-dialog';
import { CirugiaService } from '../../../core/services/cirugia-service';
import { ICirugiaResponse } from '../../../core/models/cirugia';
import { IPaginatedResponse } from '../../../core/models/api-response';
import { Subscription } from 'rxjs';

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
export class SolicitudesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fecha_hora_inicio','paciente','dni','servicio','estado','tipo','prioridad','anestesia','quirofano'];
  dataSource = new MatTableDataSource<any>([]);
  page = 0;
  pageSize = 16;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private paginatorSub?: Subscription;

  constructor(private cirugiaService: CirugiaService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize);
  }

  ngAfterViewInit(): void {
    // si quieres paginación cliente activar dataSource.paginator; para servidor no es necesario
    // this.dataSource.paginator = this.paginator;

    // opcional: subscribe para detectar cambios de pageSize desde UI
    this.paginatorSub = this.paginator.page.subscribe((ev: PageEvent) => {
      this.onPage(ev);
    });
  }

  ngOnDestroy(): void {
    this.paginatorSub?.unsubscribe();
  }

  loadPage(page: number, pageSize: number) {
    this.cirugiaService.getCirugias(page, pageSize).subscribe((resp: IPaginatedResponse<ICirugiaResponse>) => {
      this.dataSource.data = resp.data;
      this.totalItems = resp.pagination.totalItems;
      this.page = resp.pagination.page;
      this.pageSize = resp.pagination.pageSize;

      // actualizar UI del paginator si existe
      if (this.paginator) {
        this.paginator.pageIndex = this.page;
        this.paginator.pageSize = this.pageSize;
      }
    }, err => { console.error('Error loading cirugias', err); });
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

  applyFilter(filterValue: string) {
    // si usas paginado en backend, deberías aplicar filtro en el servicio en vez de aqui
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verDetalle(row: Solicitud) {
    // abrir dialog o expandir fila con detalle
    console.log('ver detalle', row);
  }

  getCirugias() {
    this.cirugiaService.getCirugias().subscribe((response) => {
      console.log('Cirugías obtenidas:', response);
    });
    console.log('Obteniendo cirugías...');
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
      }
    });
  }
}
