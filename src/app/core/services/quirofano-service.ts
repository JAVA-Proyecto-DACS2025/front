import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { IApiResponse } from '../models/api-response';
import { IQuirofano } from '../models/quirofano';

@Injectable({
  providedIn: 'root'
})
export class QuirofanoService extends BaseApiService {
  
  getQuirofanos() {
    return this.get<IApiResponse<IQuirofano[]>>('/quirofano');
  }
  

  
}
