import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CirugiaService } from '../../core/services/cirugia-service';

type Slot = { label: string; time: string; date: Date };
type DayColumn = { date: Date; title: string; slots: Slot[] };

@Component({
  selector: 'app-seleccion-turnos',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './seleccion-turnos.html',
  styleUrl: './seleccion-turnos.css',
})
export class SeleccionTurnos {
  columns: DayColumn[] = [];
  selectedIndex = 0;
  servicioId = 0;
  selectedDays = 7;
  readonly daysOptions = [7, 14, 30, 60];

  constructor(
    private dialogRef: MatDialogRef<SeleccionTurnos>,
    private cirugiaService: CirugiaService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      days?: number;
      startHour?: string;
      endHour?: string;
      intervalMinutes?: number;
      servicioId?: number;
    } | null
  ) {
    const days = data?.days ?? 7;
    const startHour = data?.startHour ?? '08:00';
    const endHour = data?.endHour ?? '17:30';
    const interval = data?.intervalMinutes ?? 30;
    this.servicioId = data?.servicioId ?? 0;
    this.selectedDays = days;
    // Prebuild a local skeleton while the backend responde
    this.columns = this.buildColumns(days, startHour, endHour, interval);

  }

  ngOnInit(): void {
    this.loadTurnos(this.selectedDays);
  }

  changeDays(days: number): void {
    if (days === this.selectedDays) return;
    this.loadTurnos(days);
  }

  private loadTurnos(days: number): void {
    this.selectedDays = days;
    this.selectedIndex = 0;
    this.cirugiaService.getTurnosDisponibles(this.servicioId, days).subscribe({
      next: (resp) => {
        const horarios = resp?.data ?? resp;
        if (Array.isArray(horarios) && horarios.length > 0) {
          this.buildColumnsFromBackend(horarios);
        } else {
          console.warn('No turnos available or invalid response format');
        }
      },
      error: (err) => {
        console.error('Error al cargar turnos disponibles:', err);
      }
    });
  }

  private buildColumnsFromBackend(horarios: string[]): void {
    // horarios es un array de ISO strings: ["2025-12-16T08:00:00", "2025-12-16T08:30:00", ...]
    if (!Array.isArray(horarios) || horarios.length === 0) {
      console.warn('No hay turnos disponibles o formato inválido');
      return;
    }

    const columnMap = new Map<string, DayColumn>();
    
    horarios.forEach((isoString: string) => {
      const fecha = new Date(isoString);
      
      // Extraer fecha en formato YYYY-MM-DD para agrupar
      const yyyy = fecha.getFullYear();
      const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const dd = fecha.getDate().toString().padStart(2, '0');
      const fechaKey = `${yyyy}-${mm}-${dd}`;
      
      // Crear columna si no existe
      if (!columnMap.has(fechaKey)) {
        const title = this.formatDayTitle(fecha);
        columnMap.set(fechaKey, { date: fecha, title, slots: [] });
      }
      
      // Extraer hora en formato HH:MM
      const hh = fecha.getHours().toString().padStart(2, '0');
      const min = fecha.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hh}:${min}`;
      
      const slot: Slot = {
        label: timeStr,
        time: timeStr,
        date: fecha
      };
      
      columnMap.get(fechaKey)!.slots.push(slot);
    });
    
    this.columns = Array.from(columnMap.values());
  }

  private buildColumns(
    days: number,
    startHour: string,
    endHour: string,
    interval: number
  ): DayColumn[] {
    const out: DayColumn[] = [];
    for (let i = 0; i < days; i++) {
      const date = this.addDays(new Date(), i);
      const title = this.formatDayTitle(date);
      const slots = this.generateSlotsForDate(date, startHour, endHour, interval);
      out.push({ date, title, slots });
    }
    return out;
  }

  private generateSlotsForDate(
    date: Date,
    startHour: string,
    endHour: string,
    interval: number
  ): Slot[] {
    const [sh, sm] = startHour.split(':').map(Number);
    const [eh, em] = endHour.split(':').map(Number);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), eh, em, 0, 0);
    const slots: Slot[] = [];
    for (let t = new Date(start); t <= end; t = new Date(t.getTime() + interval * 60000)) {
      const hh = t.getHours().toString().padStart(2, '0');
      const mm = t.getMinutes().toString().padStart(2, '0');
      slots.push({ label: `${hh}:${mm}`, time: `${hh}:${mm}`, date: new Date(t) });
    }
    return slots;
  }

  select(slot: Slot) {
    this.dialogRef.close({ date: slot.date, time: slot.time });
  }

  selectDay(index: number) {
    this.selectedIndex = index;
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  }

  private formatDayTitle(d: Date): string {
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}
