import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class CirugiaService extends BaseApiService {

  saveCirugia(data: any) {
    return this.post<any>('/cirugia', data);
  }
}
