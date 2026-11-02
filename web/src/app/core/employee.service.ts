import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, EmployeeInput, EmployeePage } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/employees`;

  list(cursor?: string, limit = 10): Observable<EmployeePage> {
    let params = new HttpParams().set('limit', limit);

    if (cursor) {
      params = params.set('cursor', cursor);
    }

    return this.http.get<EmployeePage>(this.url, { params });
  }

  get(id: string): Observable<Employee> {
    return this.http.get<{ data: Employee }>(`${this.url}/${id}`).pipe(map((res) => res.data));
  }

  create(input: EmployeeInput): Observable<Employee> {
    return this.http.post<{ data: Employee }>(this.url, input).pipe(map((res) => res.data));
  }

  update(id: string, input: EmployeeInput): Observable<Employee> {
    return this.http
      .put<{ data: Employee }>(`${this.url}/${id}`, input)
      .pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
