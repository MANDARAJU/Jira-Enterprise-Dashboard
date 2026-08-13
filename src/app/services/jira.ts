import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Jira {

  private apiUrl = '/api/jira';

  constructor(private http: HttpClient) {}

  getIssues(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/issues`);
  }
}