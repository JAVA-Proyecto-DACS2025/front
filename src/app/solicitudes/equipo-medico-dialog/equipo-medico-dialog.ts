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
import { MatDialogContent } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, filter } from 'rxjs/operators';
import { MatList } from "@angular/material/list";

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
    MatList
],
})
export class EquipoMedicoDialog implements OnInit, OnDestroy {
  displayedColumns: string[] = ['nombre', 'rol', 'legajo', 'accionAgregar'];
  dataSource = new MatTableDataSource<IMiembroEquipoMedico>([]);
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

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService,
    private cirugiaService: CirugiaService,
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

  ngOnInit(): void {
    this.loadEquipoMedico();
    // buscar automáticamente mientras teclea (debounce + evitar llamadas vacías + manejar errores)
    this.searchSub = this.searchControl.valueChanges.pipe(
      map(v => (typeof v === 'string' ? v : v?.nombre ?? '')),
      map(v => v?.trim() ?? ''),
      filter(q => q.length > 0),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q =>
        this.personalService.searchPersonalLite(this.page, this.pageSize, q).pipe(
          map((resp: any) => (resp?.data ?? []) as IMiembroEquipoMedico[]),
          catchError(() => of([]))
        )
      )
    ).subscribe(results => {
      this.searchResults = results;
      this.dataSource.data = results ?? [];
      this.totalItems = this.dataSource.data.length;
      this.selectedPersonal = null;
    });
  }

  loadEquipoMedico() {
    this.cirugiaService.getEquipoMedicoByCirugiaId(this.cirugiaId).subscribe((resp: any) => {
      const integrantes = (resp?.data ?? []) as IMiembroEquipoMedico[];
      integrantes.forEach((p) => this.addIntegrante(p));
    });
    this.personalService.searchPersonalLite(this.page, this.pageSize, '').subscribe((resp: any) => {
      this.dataSource.data = (resp?.data ?? []) as IMiembroEquipoMedico[];
      this.totalItems = resp?.totalItems ?? 0;
    }
    );
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
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
  }

  removeIntegrante(index: number) {
    this.equipoMedico.removeAt(index);
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
  }

  // agregar directamente desde la lista de resultados
  acceptResult(p: IMiembroEquipoMedico) {
    this.addIntegrante(p);
    // opcional: mantener resultados pero limpiar selección/terminar búsqueda
    this.searchControl.setValue('');
    this.searchResults = [];
    this.dataSource.data = [];
    this.selectedPersonal = null;
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
