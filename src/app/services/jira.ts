import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Jira {

  private apiUrl = '/api/jira';
  private masterApiUrl = '/api/master';

  constructor(private http: HttpClient) {}

  // =========================
  // Jira APIs
  // =========================

  getIssues(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/issues`);
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  // =========================
  // Master Data APIs
  // =========================

  getProjects(): Observable<any> {
    return this.http.get<any>(`${this.masterApiUrl}/projects`);
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.masterApiUrl}/users`);
  }

  getStakeholders(): Observable<any> {
    return this.http.get<any>(`${this.masterApiUrl}/stakeholders`);
  }

  getStatuses(): Observable<any> {
    return this.http.get<any>(`${this.masterApiUrl}/statuses`);
  }
}