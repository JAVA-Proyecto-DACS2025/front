import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMiembroEquipoMedico } from '../../core/models/miembro-equipo';
import { CirugiaService } from '../../core/services/cirugia-service';
import { PersonalService } from '../../core/services/personal-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogContent, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PersonalListDialog } from '../personal-list-dialog/personal-list-dialog';
import { of, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  catchError,
  filter,
} from 'rxjs/operators';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-equipo-medico-dialog',
  templateUrl: './equipo-medico-dialog.html',
  styleUrls: ['./equipo-medico-dialog.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogModule,
    MatListModule,
  ],
})
export class EquipoMedicoDialog implements OnInit, OnDestroy {
  displayedColumns: string[] = ['nombre', 'legajo', 'rol', 'accionAgregar'];
  dataSource = new MatTableDataSource<IMiembroEquipoMedico>([]);
  // seleccionado (lista de integrantes actuales)
  displayedColumnsSelected: string[] = ['nombre', 'legajo', 'rol', 'accionEliminar'];
  dataSourceSelected = new MatTableDataSource<any>([]);
  totalItems = 0;
  pageSize = 16;
  page = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  form: FormGroup;
  cirugiaId: number;

  // nuevos
  searchControl: FormControl;
  searchResults: IMiembroEquipoMedico[] = [];
  selectedPersonal: IMiembroEquipoMedico | null = null;
  private searchSub: Subscription | null = null;
  private teamSub: Subscription | null = null;

  // altura dinámica del contenedor (en px)
  containerHeight = 600;

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService,
    private cirugiaService: CirugiaService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EquipoMedicoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { cirugiaId: number }
  ) {
    this.cirugiaId = data.cirugiaId;
    this.form = this.fb.group({
      equipoMedico: this.fb.array([]),
    });
    this.searchControl = new FormControl('');
    this.page = 0;
    this.pageSize = 10;
    this.totalItems = 0;
  }

  openPersonalListDialog() {
    const dialogRef = this.dialog.open(PersonalListDialog, {
      width: '860px',
      data: { q: this.searchControl.value ?? '' },
    });

    dialogRef.afterClosed().subscribe((selected: IMiembroEquipoMedico | null) => {
      if (selected) {
        this.addIntegrante(selected);
      }
    });
  }

  ngOnInit(): void {
    this.loadEquipoMedico();
  }

  loadEquipoMedico() {
    this.cirugiaService.getEquipoMedicoByCirugiaId(this.cirugiaId).subscribe((resp: any) => {
      const integrantes = (resp?.data ?? []) as IMiembroEquipoMedico[];
      integrantes.forEach((p) => this.addIntegrante(p));
      // sincronizar datasource de seleccionados
      this.dataSourceSelected.data = this.equipoMedico.value ?? [];
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.teamSub?.unsubscribe();
  }

  // getter de conveniencia
  get equipoMedico(): FormArray {
    return this.form.get('equipoMedico') as FormArray;
  }

  // agrega un integrante (evita duplicados por id)
  addIntegrante(personal?: Partial<IMiembroEquipoMedico>) {
    // mapear posibles nombres de id que venga de la API (id o personalId)
    const id = (personal as any)?.personalId ?? (personal as any)?.id ?? null;
    if (id !== null && this.equipoMedico.controls.some((c) => c.value.personalId === id)) {
      return; // ya agregado
    }

    const grupo = this.fb.group({
      personalId: [id],
      cirugiaId: [this.cirugiaId],
      nombre: [personal?.nombre ?? ''],
      rol: [personal?.rol ?? ''],
      legajo: [personal?.legajo ?? ''],
    });
    this.equipoMedico.push(grupo);
    // mantener tabla de seleccionados en sync
    this.dataSourceSelected.data = this.equipoMedico.value ?? [];
  }

  removeIntegrante(index: number) {
    this.equipoMedico.removeAt(index);
    this.dataSourceSelected.data = this.equipoMedico.value ?? [];
  }

  selectPersonal(p: IMiembroEquipoMedico) {
    this.selectedPersonal = p;
    this.searchControl.setValue(p.nombre);
    this.searchResults = [];
  }

  // agregar la selección actual
  addSelectedPersonal() {
    if (!this.selectedPersonal) {
      return;
    }
    this.addIntegrante(this.selectedPersonal);
    this.selectedPersonal = null;
    this.searchControl.setValue('');
    this.dataSourceSelected.data = this.equipoMedico.value ?? [];
  }

  // agregar directamente desde la lista de resultados
  acceptResult(p: IMiembroEquipoMedico) {
    this.addIntegrante(p);
    // opcional: mantener resultados pero limpiar selección/terminar búsqueda
    this.searchControl.setValue('');
    this.searchResults = [];
    this.dataSource.data = [];
    this.selectedPersonal = null;
    this.dataSourceSelected.data = this.equipoMedico.value ?? [];
  }

  // guardar todos los integrantes (ajustar payload y método del servicio)
  saveEquipoMedico() {
    const payload = this.equipoMedico.value;

    this.cirugiaService.saveEquipoMedico(payload, this.cirugiaId).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error guardando equipo médico', err),
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  onPage(event: PageEvent) {
    const nextPage = event.pageIndex ?? 0;
    const nextSize = event.pageSize ?? this.pageSize;
    this.page = nextPage;
    this.pageSize = nextSize;
    this.paginator.pageIndex = this.page;
    this.paginator.pageSize = this.pageSize;
  }
}
