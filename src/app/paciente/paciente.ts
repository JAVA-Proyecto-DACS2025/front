import { Component } from '@angular/core';
import { PacienteList } from './paciente-list/paciente-list';
import { PageHeader } from "../shared/page-header/page-header";

@Component({
  selector: 'app-paciente',
  imports: [PacienteList, PageHeader],
  templateUrl: './paciente.html',
  styleUrls: ['./paciente.css']
})
export class Paciente {

}
