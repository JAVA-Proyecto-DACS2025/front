import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioService, IKeycloakUser } from '../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css'
})
export class UsuariosList implements OnInit {
  totalItems: number = 0;
  pageSize: number = 16;
  page: number = 0;
  isLoading: boolean = false;

  dataSource = new MatTableDataSource<IKeycloakUser>([]);
  displayedColumns: string[] = [
    'username',
    'email',
    'nombre',
    'estado',
    'emailVerified',
    'creado',
  ];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.loadPage(this.page, this.pageSize);
  }

  onPage(event: PageEvent) {
    const nextPage = event.pageIndex ?? 0;
    const nextSize = event.pageSize ?? this.pageSize;

    this.page = nextPage;
    this.pageSize = nextSize;

    this.loadPage(nextPage, nextSize);
  }

  loadPage(page: number, pageSize: number) {
    this.isLoading = true;
    this.usuarioService.getUsuarios(page, pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.contenido || [];
        this.totalItems = response.totalElementos || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter(filterValue: string) {
    if (filterValue.trim()) {
      this.usuarioService.searchUsuarios(0, this.pageSize, filterValue).subscribe({
        next: (response) => {
          this.dataSource.data = response.contenido || [];
          this.totalItems = response.totalElementos || 0;
        },
        error: (error) => {
          console.error('Error al buscar usuarios:', error);
        }
      });
    } else {
      this.loadPage(this.page, this.pageSize);
    }
  }

  formatDate(timestamp?: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getFullName(user: IKeycloakUser): string {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  }
}
