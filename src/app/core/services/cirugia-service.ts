import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ICirugiaRequest, ICirugiaResponse } from '../models/cirugia';
import { IPaginatedResponse } from '../../core/models/api-response';

@Injectable({
  providedIn: 'root',
})
export class CirugiaService extends BaseApiService {

  saveCirugia(data: ICirugiaRequest) {
    return this.post<any>('/cirugia', data);
  }

  getCirugias(page = 0, pageSize = 16) {
    const params = { page: String(page), size: String(pageSize) };
    return this.get<IPaginatedResponse<ICirugiaResponse>>('/cirugia', params);
  }
  
}
