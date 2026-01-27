import { Component } from '@angular/core';
import { DatePipe, CommonModule, NgFor, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CirugiaService } from '../../core/services/cirugia.service';
import { QuirofanoService } from '../../core/services/quirofano.service';
import { IQuirofano } from '../../core/models/quirofano';

interface TurnoAgenda {
  fecha: string;
  hora: string;
  horaFin: string;
  horaInicioNum: number; // hora inicio en formato numérico (8, 9, 10...)
  horaFinNum: number; // hora fin en formato numérico
  duracionHoras: number; // cantidad de columnas que ocupa
  descripcion: string;
  paciente: string;
  servicio: string;
  quirofano: string;
  quirofanoId: number;
  color: string;
}

@Component({
  selector: 'app-agenda',
  imports: [DatePipe, CommonModule, NgFor, NgClass, MatIconModule, MatButtonModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda {
  today = new Date();
  currentWeekStart: Date;
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  weekDates: Date[] = [];
  weekLabel = '';
  turnos: TurnoAgenda[] = [];
  
  // Horas de la jornada (columnas)
  horasJornada: string[] = [];
  horaInicio = 8;
  horaFin = 18;
  
  // Quirófanos
  quirofanos: IQuirofano[] = [];
  selectedQuirofanoId: number | null = null; // null = todos

  constructor(
    private cirugiaService: CirugiaService,
    private quirofanoService: QuirofanoService
  ) {
    this.currentWeekStart = this.getStartOfWeek(this.today);
    this.generateHorasJornada();
    this.loadQuirofanos();
    this.updateWeek();
  }

  private generateHorasJornada() {
    this.horasJornada = [];
    for (let h = this.horaInicio; h <= this.horaFin; h++) {
      this.horasJornada.push(`${h.toString().padStart(2, '0')}:00`);
    }
  }

  private loadQuirofanos() {
    this.quirofanoService.getQuirofanos().subscribe((resp: any) => {
      const data = resp?.data ?? resp ?? [];
      this.quirofanos = Array.isArray(data) ? data : [];
    });
  }

  selectQuirofano(quirofanoId: number | null) {
    this.selectedQuirofanoId = quirofanoId;
  }

  get filteredTurnos(): TurnoAgenda[] {
    if (this.selectedQuirofanoId === null) {
      return this.turnos;
    }
    return this.turnos.filter(t => t.quirofanoId === this.selectedQuirofanoId);
  }

  updateWeek() {
    this.weekDates = Array.from({ length: 7 }, (_, i) => this.addDays(this.currentWeekStart, i));
    const start = this.weekDates[0];
    const end = this.weekDates[6];
    this.weekLabel = `${this.formatDate(start)} - ${this.formatDate(end)}`;

    this.cirugiaService
      .getCirugiasPorFechas(this.getDateString(start), this.getDateString(end))
      .subscribe((response: any) => {
        if (response && response.data) {
          const cirugias = (response.data.contenido || response.data || []);
          this.turnos = cirugias.map((cirugia: any) => {
            const horaInicioStr = cirugia.horaInicio || '08:00';
            const horaFinStr = cirugia.horaFin || '09:00';
            const [hhInicio] = horaInicioStr.split(':').map(Number);
            const [hhFin] = horaFinStr.split(':').map(Number);
            const duracion = Math.max(1, hhFin - hhInicio);
            
            return {
              fecha: this.getDateString(new Date(cirugia.fechaInicio)),
              hora: horaInicioStr.substring(0, 5),
              horaFin: horaFinStr.substring(0, 5),
              horaInicioNum: hhInicio,
              horaFinNum: hhFin,
              duracionHoras: duracion,
              descripcion: `${cirugia.pacienteNombre}\n${cirugia.servicioNombre}\n${cirugia.quirofanoNombre}`,
              paciente: cirugia.pacienteNombre || '',
              servicio: cirugia.servicioNombre || '',
              quirofano: cirugia.quirofanoNombre || '',
              quirofanoId: cirugia.quirofanoId || 0,
              color: 'green',
            };
          });
        }
      });
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  getDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  previousWeek() {
    this.currentWeekStart = this.addDays(this.currentWeekStart, -7);
    this.updateWeek();
  }

  nextWeek() {
    this.currentWeekStart = this.addDays(this.currentWeekStart, 7);
    this.updateWeek();
  }

  getTurnosForDayAndHour(date: Date, hora: string): TurnoAgenda[] {
    const dateStr = this.getDateString(date);
    const horaNum = parseInt(hora.substring(0, 2), 10);
    // Solo devolver turnos que INICIAN en esta hora exacta
    return this.filteredTurnos.filter(t => {
      return t.fecha === dateStr && t.horaInicioNum === horaNum;
    });
  }

  // Calcula el ancho del turno basado en su duración
  getTurnoWidth(turno: TurnoAgenda): string {
    // Cada columna tiene un ancho base, el turno se extiende según duración
    // Usamos calc() para que se adapte al ancho de las columnas
    return `calc(${turno.duracionHoras * 100}% + ${(turno.duracionHoras - 1) * 1}px)`;
  }

  getTurnosForDay(date: Date): TurnoAgenda[] {
    const dateStr = this.getDateString(date);
    return this.filteredTurnos.filter((t) => t.fecha === dateStr);
  }
}
