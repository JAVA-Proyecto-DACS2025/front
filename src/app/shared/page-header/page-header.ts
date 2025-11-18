import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-page-header',
  imports: [NgIf],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.css']
})
export class PageHeader {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
