import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ICirugia } from '../models/cirugia';

@Injectable({
  providedIn: 'root'
})
export class CirugiaService extends BaseApiService {

  saveCirugia(data: ICirugia) {
    return this.post<any>('/cirugia', data);
  }
}
