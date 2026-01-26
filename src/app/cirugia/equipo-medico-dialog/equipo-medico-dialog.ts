import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMiembroEquipoMedico } from '../../core/models/miembro-equipo';
import { CirugiaService } from '../../core/services/cirugia.service';
import { PersonalService } from '../../core/services/personal.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogContent, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PersonalListDialog } from '../personal-list-dialog/personal-list-dialog';
// rxjs operators removed; no streaming search in this dialog
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
    /* MatSortModule and MatPaginatorModule removed (not used) */
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
  // seleccionado (lista de integrantes actuales)
  displayedColumnsSelected: string[] = ['nombre', 'legajo', 'rol', 'accionEliminar'];
  dataSourceSelected = new MatTableDataSource<any>([]);
  form: FormGroup;
  cirugiaId: number;

  // nuevos
  searchControl: FormControl;

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
    // no active subscriptions to clean up
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
    // helper kept for potential future use
    this.searchControl.setValue(p.nombre);
  }

  // agregar la selección actual
  addSelectedPersonal() {
    // not used in current UI
  }

  // agregar directamente desde la lista de resultados
  acceptResult(p: IMiembroEquipoMedico) {
    this.addIntegrante(p);
    // opcional: mantener resultados pero limpiar selección/terminar búsqueda
    this.searchControl.setValue('');
    // clear any temporary selections
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

}
