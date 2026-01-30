import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../shared/page-header/page-header';
import { UsuariosList } from './usuarios-list/usuarios-list';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, PageHeader, UsuariosList],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios {

}
