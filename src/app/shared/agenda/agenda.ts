import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CirugiaService } from '../../core/services/cirugia.service';

@Component({
  selector: 'app-agenda',
  imports: [DatePipe, CommonModule, MatIconModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda {
  today = new Date();
  currentWeekStart: Date;
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  weekDates: Date[] = [];
  weekLabel = '';

  // Mock de turnos: deberías reemplazar esto por tu fuente real de datos
  turnos = [
    {
      fecha: this.getDateString(this.addDays(this.getStartOfWeek(new Date()), 0)),
      hora: '08:00',
      descripcion: 'Juan Martínez\nOrtopedia\nQuirófano A',
      color: 'green',
    },
    {
      fecha: this.getDateString(this.addDays(this.getStartOfWeek(new Date()), 0)),
      hora: '10:30',
      descripcion: 'Laura Sánchez\nOftalmología\nQuirófano C',
      color: 'green',
    },
    {
      fecha: this.getDateString(this.addDays(this.getStartOfWeek(new Date()), 1)),
      hora: '09:00',
      descripcion: 'Roberto Díaz\nCirugía General\nQuirófano B',
      color: 'blue',
    },
    {
      fecha: this.getDateString(this.addDays(this.getStartOfWeek(new Date()), 2)),
      hora: '14:00',
      descripcion: 'Ana García\nUrología\nQuirófano A',
      color: 'yellow',
    },
    {
      fecha: this.getDateString(this.addDays(this.getStartOfWeek(new Date()), 4)),
      hora: '11:00',
      descripcion: 'Carlos Ruiz\nTraumatología\nQuirófano D',
      color: 'green',
    },
  ];

  constructor(private cirugiaService: CirugiaService) {
    this.currentWeekStart = this.getStartOfWeek(this.today);
    this.updateWeek();
  }

  updateWeek() {
    this.weekDates = Array.from({ length: 7 }, (_, i) => this.addDays(this.currentWeekStart, i));
    const start = this.weekDates[0];
    const end = this.weekDates[6];
    this.weekLabel = `${this.formatDate(start)} - ${this.formatDate(end)}`;

    this.cirugiaService
      .getCirugiasPorFechas(this.getDateString(start), this.getDateString(end))
      .subscribe((response) => {
        if (response && response.data) {
          console.log('Cirugías de la semana:', response.data);
          this.turnos = response.data.map((cirugia) => {
            return {
              fecha: this.getDateString(new Date(cirugia.fechaInicio)),
              hora: cirugia.horaInicio,
              descripcion: `${cirugia.pacienteNombre}\n${cirugia.servicioNombre}\n${cirugia.quirofanoNombre}`,
              color: 'green', // Puedes personalizar el color según el estado o prioridad
            };
          });
        }
      });
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    // getDay(): 0=Dom, 1=Lun, ..., 6=Sab
    const diff = d.getDate() - (day === 0 ? 6 : day - 1); // Lunes como inicio
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
    // Formato: dd/MM/yyyy
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

  getTurnosForDay(date: Date) {
    const dateStr = this.getDateString(date);
    return this.turnos.filter((t) => t.fecha === dateStr);
  }
}
