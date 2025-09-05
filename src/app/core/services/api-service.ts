import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IRequestTest } from '../models/irequest-test';
import { ITestResponse } from '../models/iresponse';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) {

    }
   getPing() {
        const url = `${environment.backendForFrontendUrl}/ping`;
        return this.http
            .get(url, { responseType: 'text' })
            .pipe();
    }
  
    getTest() {
        const url ='assets/json/test.json';
        return this.http
            .get<ITestResponse>(url, this.headers)
            .pipe();
    }
    get headers() {
        return {
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }

}
