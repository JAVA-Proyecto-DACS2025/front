import { Component } from '@angular/core';
import { SolicitudesListComponent } from "../components/solicitudes-list/solicitudes-list";

@Component({
  selector: 'app-solicitudes',
  imports: [SolicitudesListComponent],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css'
})
export class SolicitudesComponent {

}
  