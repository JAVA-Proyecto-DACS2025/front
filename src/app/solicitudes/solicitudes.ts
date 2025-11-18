import { Component } from '@angular/core';
import { SolicitudesListComponent } from "./components/solicitudes-list/solicitudes-list";
import { PageHeader } from "../shared/page-header/page-header";

@Component({
  selector: 'app-solicitudes',
  imports: [SolicitudesListComponent, PageHeader],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css'
})
export class SolicitudesComponent {

}
  