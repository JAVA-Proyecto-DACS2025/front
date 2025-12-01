import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { IPersonal, IPersonalUpdate } from '../models/personal';
import { IResponse } from '../models/iresponse';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class PersonalService extends BaseApiService {
  updatePersonal(personalData: IPersonalUpdate) {
    return this.put<IApiResponse<IPersonal>>(`/personal/${personalData.id}`, personalData);
  }

  getPersonal(page = 0, pageSize = 16) {
    const params = { page: String(page), size: String(pageSize) };
    return this.get<IPaginatedResponse<IPersonal>>('/personal', params);
  }

  createPersonal(personalData: IPersonal) {
    return this.post<IApiResponse<IPersonal>>('/personal', personalData);
  }

  deletePersonal(id: number) {
    return this.delete<IApiResponse>(`/personal/${id}`);
  }
}
