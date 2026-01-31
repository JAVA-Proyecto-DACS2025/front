import { Component, inject } from '@angular/core';
import { DatePipe, CommonModule, NgFor, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CirugiaService } from '../../core/services/cirugia.service';
import { QuirofanoService } from '../../core/services/quirofano.service';
import { IQuirofano } from '../../core/models/quirofano';
import { CirugiaDialog } from '../../cirugia/cirugia-dialog/cirugia-dialog';

interface TurnoAgenda {
  id: number; // ID de la cirugía
  fecha: string;
  hora: string;
  horaFin: string;
  horaInicioNum: number; // hora inicio en formato numérico (8, 9, 10...)
  minInicio: number; // minutos de inicio (0 o 30)
  horaFinNum: number; // hora fin en formato numérico
  minFin: number; // minutos de fin (0 o 30)
  duracionEnMedias: number; // duración en medias horas (ej: 1.5h = 3)
  descripcion: string;
  paciente: string;
  pacienteId: number;
  servicio: string;
  servicioId: number;
  quirofano: string;
  quirofanoId: number;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
  dni: string;
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

  private cirugiaService = inject(CirugiaService);
  private quirofanoService = inject(QuirofanoService);
  private dialog = inject(MatDialog);

  constructor() {
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
      // Seleccionar el primer quirófano por defecto
      if (this.quirofanos.length > 0 && this.selectedQuirofanoId === null) {
        this.selectedQuirofanoId = this.quirofanos[0].id;
      }
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
            const [hhInicio, mmInicio] = horaInicioStr.split(':').map(Number);
            const [hhFin, mmFin] = horaFinStr.split(':').map(Number);
            
            // Calcular duración en medias horas
            const inicioEnMedias = hhInicio * 2 + (mmInicio >= 30 ? 1 : 0);
            const finEnMedias = hhFin * 2 + (mmFin >= 30 ? 1 : 0);
            const duracionEnMedias = Math.max(1, finEnMedias - inicioEnMedias);
            
            return {
              id: cirugia.id,
              fecha: this.getDateString(new Date(cirugia.fechaInicio)),
              hora: horaInicioStr.substring(0, 5),
              horaFin: horaFinStr.substring(0, 5),
              horaInicioNum: hhInicio,
              minInicio: mmInicio,
              horaFinNum: hhFin,
              minFin: mmFin,
              duracionEnMedias: duracionEnMedias,
              descripcion: `${cirugia.pacienteNombre}\n${cirugia.servicioNombre}\n${cirugia.quirofanoNombre}`,
              paciente: cirugia.pacienteNombre || '',
              pacienteId: cirugia.pacienteId,
              servicio: cirugia.servicioNombre || '',
              servicioId: cirugia.servicioId,
              quirofano: cirugia.quirofanoNombre || '',
              quirofanoId: cirugia.quirofanoId || 0,
              estado: cirugia.estado || '',
              prioridad: cirugia.prioridad || '',
              anestesia: cirugia.anestesia || '',
              tipo: cirugia.tipo || '',
              dni: cirugia.dni || '',
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

  // Calcula el offset left del turno (50% si empieza a :30)
  getTurnoLeft(turno: TurnoAgenda): string {
    return turno.minInicio >= 30 ? '50%' : '0';
  }

  // Calcula el ancho del turno basado en su duración en medias horas
  getTurnoWidth(turno: TurnoAgenda): string {
    // Cada media hora = 50% de una columna
    const widthPercent = turno.duracionEnMedias * 50;
    // Ajustar para bordes entre celdas
    const columnsCrossed = Math.ceil(turno.duracionEnMedias / 2);
    return `calc(${widthPercent}% + ${Math.max(0, columnsCrossed - 1)}px)`;
  }

  getTurnosForDay(date: Date): TurnoAgenda[] {
    const dateStr = this.getDateString(date);
    return this.filteredTurnos.filter((t) => t.fecha === dateStr);
  }

  openCirugiaDialog(turno: TurnoAgenda) {
    // Formatear fecha para el dialog
    const [yyyy, mm, dd] = turno.fecha.split('-');
    const fechaFormateada = `${dd}/${mm}/${yyyy}`;
    
    const dialogData = {
      id: turno.id,
      pacienteId: turno.pacienteId,
      pacienteNombre: turno.paciente,
      dni: turno.dni,
      quirofanoId: turno.quirofanoId,
      quirofano: turno.quirofano,
      servicioId: turno.servicioId,
      servicio: turno.servicio,
      fechaInicio: fechaFormateada,
      horaInicio: `${turno.hora} HS`,
      estado: turno.estado,
      prioridad: turno.prioridad,
      anestesia: turno.anestesia,
      tipo: turno.tipo,
    };

    const dialogRef = this.dialog.open(CirugiaDialog, {
      width: '500px',
      maxHeight: '90vh',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si se guardó/actualizó, recargar la agenda
        this.updateWeek();
      }
    });
  }
}
