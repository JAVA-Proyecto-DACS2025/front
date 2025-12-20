import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { CirugiaService } from '../../core/services/cirugia-service';
import { ICirugia } from '../../core/models/cirugia';
import { IPaginatedResponse } from '../../core/models/api-response';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { CirugiaDialog } from '../cirugia-dialog/cirugia-dialog';
import { EquipoMedicoDialog } from '../equipo-medico-dialog/equipo-medico-dialog';

@Component({
  selector: 'app-solicitudes-list',
  templateUrl: './solicitudes-list.html',
  styleUrls: ['./solicitudes-list.css'],
  standalone: true,
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
export class SolicitudesListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'fechaInicio',
    'horaInicio',
    'pacienteNombre',
    'dni',
    'servicioNombre',
    'estado',
    'tipo',
    'prioridad',
    'anestesia',
    'quirofanoNombre',
    'acciones',
    'medicos',
    'eliminar',
  ];
  dataSource = new MatTableDataSource<ICirugia>([]);
  page = 0;
  pageSize = 16;
  totalItems = 0;
  private pageCache = new Map<string, { data: ICirugia[]; total: number }>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private paginatorSub?: Subscription;

  constructor(private cirugiaService: CirugiaService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize);
  }

  ngAfterViewInit(): void {
    // configurar sort por fecha + hora
    this.dataSource.sortingDataAccessor = (item: any, prop: string) => {
      if (prop === 'fechaInicio') {
        return new Date(`${item.fechaInicio}T${item.horaInicio ?? '00:00:00'}`);
      }
      if (prop === 'horaInicio') {
        return item.horaInicio;
      }
      return (item as any)[prop];
    };

    this.dataSource.sort = this.sort;

    // default: ordenar por fecha ascendente
    setTimeout(() => {
      this.sort.active = 'fechaInicio';
      this.sort.direction = 'asc';
    });
  }

  ngOnDestroy(): void {
    this.paginatorSub?.unsubscribe();
  }

  loadPage(page: number, pageSize: number) {
    const cacheKey = `${page}-${pageSize}`;

    // verificar si la página está en caché
    if (this.pageCache.has(cacheKey)) {
      const cached = this.pageCache.get(cacheKey)!;
      this.dataSource.data = cached.data;
      this.totalItems = cached.total;
      this.page = page;
      this.pageSize = pageSize;

      if (this.paginator) {
        this.paginator.pageIndex = this.page;
        this.paginator.pageSize = this.pageSize;
      }
      return;
    }

    // si no está en caché, llamar al servidor
    this.cirugiaService.getCirugias(page, pageSize).subscribe(
      (resp: any) => {
        // Adaptar a la nueva estructura de paginación
        const content = resp?.data?.content || [];
        const totalItems = resp?.data?.totalElements || 0;
        const totalPages = resp?.data?.totalPages || 1;
        const pageNumber = resp?.data?.number || page;
        const pageSizeResp = resp?.data?.size || pageSize;

        this.dataSource.data = content;
        this.totalItems = totalItems;
        this.page = pageNumber;
        this.pageSize = pageSizeResp;

        // guardar en caché
        this.pageCache.set(cacheKey, {
          data: content,
          total: totalItems,
        });

        if (this.paginator) {
          this.paginator.pageIndex = this.page;
          this.paginator.pageSize = this.pageSize;
        }
      },
      (err) => console.error('Error loading cirugias', err)
    );
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPage(event: PageEvent) {
    this.loadPage(event.pageIndex, event.pageSize);
  }

  openCirugia(cirugia?: ICirugia) {
    this.dialog
      .open(CirugiaDialog, { width: '400px', data: cirugia })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.pageCache.clear(); // limpiar caché cuando se modifica data
          this.loadPage(this.page, this.pageSize);
        }
      });
  }

  openEquipoMedico(cirugiaId: number) {
    this.dialog.open(EquipoMedicoDialog, { data: { cirugiaId } });
  }

  deleteCirugia(cirugiaId: number) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar eliminación',
          message: '¿Estás seguro de que deseas eliminar esta cirugía?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.cirugiaService.deleteCirugia(cirugiaId).subscribe(() => {
            this.pageCache.clear(); // limpiar caché cuando se elimina
            this.loadPage(this.page, this.pageSize);
          });
        }
      });
  }
}
