import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- ¡Importa esto!
import { ApiService } from '../core/services/api-service';
import { ITestResponse } from '../core/models/iresponse';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
    imports: [CommonModule] // <--- ¡Añade esto al array!
})
export class DashboardComponent implements OnInit {

  pingResult = '';
  testResult: ITestResponse | undefined;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    // Llamamos a los servicios cuando el componente se inicializa
    this.getPingResult();
    this.getTestResult();
  }

  getPingResult(): void {
    this.apiService.getPing().subscribe(
      (response) => {
        this.pingResult = response;
        console.log('Resultado del Ping:', this.pingResult);
      },
      (error) => {
        console.error('Error al hacer ping:', error);
        this.pingResult = 'Error al conectar con el backend.';
      }
    );
  }

  getTestResult(): void {
    this.apiService.getTest().subscribe(
      (response) => {
        this.testResult = response;
        console.log('Resultado de Test:', this.testResult);
      },
      (error) => {
        console.error('Error al obtener datos de test:', error);
      }
    );
  }

}