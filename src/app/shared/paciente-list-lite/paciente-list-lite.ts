import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PacienteService } from '../../core/services/paciente';
import { IPacienteLite } from '../../core/models/paciente';

@Component({
  selector: 'app-paciente-list-lite',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './paciente-list-lite.html',
  styleUrls: ['./paciente-list-lite.css']
})
export class PacienteListLite implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() pacienteSeleccionado = new EventEmitter<IPacienteLite>();
  @Output() cerrarListado = new EventEmitter<void>();

  dataSource = new MatTableDataSource<IPacienteLite>([]);
  displayedColumns: string[] = ['nombre', 'apellido', 'dni', 'accionAgregar'];

  totalItems = 0;
  pageSize = 16;
  page = 0;
  private filterText = '';

  constructor(
    private pacienteService: PacienteService,
    @Optional() private dialogRef?: MatDialogRef<PacienteListLite>
  ) {}

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize);
  }

  ngAfterViewInit(): void {
    // No conectar paginator al dataSource - paginación server-side
    this.dataSource.sort = this.sort;
  }

  onPage(event: PageEvent) {
    const nextPage = event.pageIndex ?? 0;
    const nextSize = event.pageSize ?? this.pageSize;

    this.page = nextPage;
    this.pageSize = nextSize;

    if (!this.filterText) {
      this.loadPage(nextPage, nextSize);
    }
  }

  seleccionarPaciente(paciente: IPacienteLite) {
    this.pacienteSeleccionado.emit(paciente);
    this.dialogRef?.close(paciente);
  }

  applyFilter(value: string) {
    this.filterText = value?.trim();
    this.page = 0;

    if (!this.filterText) {
      this.loadPage(0, this.pageSize);
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      return;
    }

    // Cuando hay filtro, carga búsqueda (cliente-side)
    this.pacienteService.searchPacientes(this.filterText).subscribe((lista) => {
      this.dataSource.data = lista ?? [];
      this.totalItems = this.dataSource.data.length;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
    });
  }

  cerrar() {
    this.cerrarListado.emit();
    this.dialogRef?.close();
  }

  private loadPage(page: number, pageSize: number) {
    this.pacienteService.getPacientesLite(page, pageSize).subscribe((resp) => {
      this.dataSource.data = resp?.data ?? [];
      this.totalItems = resp?.pagination?.totalItems ?? this.dataSource.data.length;
      this.pageSize = resp?.pagination?.pageSize ?? pageSize;
      this.page = resp?.pagination?.page ?? page;
      
      // Sincronizar paginator después de cargar
      if (this.paginator) {
        this.paginator.pageIndex = this.page;
        this.paginator.pageSize = this.pageSize;
      }
    });
  }
}
