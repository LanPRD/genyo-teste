import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Employee, EmployeeInput } from './employee.model';
import { EmployeeService } from './employee.service';

const url = `${environment.apiUrl}/employees`;

const employee: Employee = {
  id: 'abc',
  name: 'Maria da Silva',
  closingPeriodicity: 'MONTHLY',
  hireDate: '2026-01-10T00:00:00.000Z',
  terminationDate: null,
  workdayStartTime: '08:00',
  workdayEndTime: '17:00',
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
};

const input: EmployeeInput = {
  name: 'Maria da Silva',
  hireDate: '2026-01-10',
  workdayStartTime: '08:00',
  workdayEndTime: '17:00',
  closingPeriodicity: 'MONTHLY',
};

describe('EmployeeService', () => {
  let service: EmployeeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lists the first page with the default limit', () => {
    const page = { data: [employee], meta: { limit: 10, nextCursor: null } };
    let result: unknown;

    service.list().subscribe((value) => (result = value));
    const request = http.expectOne((r) => r.url === url);
    request.flush(page);

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.has('cursor')).toBe(false);
    expect(result).toEqual(page);
  });

  it('sends the cursor to list the next page', () => {
    service.list('cursor-1', 5).subscribe();
    const request = http.expectOne((r) => r.url === url);
    request.flush({ data: [], meta: { limit: 5, nextCursor: null } });

    expect(request.request.params.get('cursor')).toBe('cursor-1');
    expect(request.request.params.get('limit')).toBe('5');
  });

  it('gets an employee and unwraps the data envelope', () => {
    let result: Employee | undefined;

    service.get('abc').subscribe((value) => (result = value));
    http.expectOne(`${url}/abc`).flush({ data: employee });

    expect(result).toEqual(employee);
  });

  it('creates an employee with POST', () => {
    let result: Employee | undefined;

    service.create(input).subscribe((value) => (result = value));
    const request = http.expectOne(url);
    request.flush({ data: employee });

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(input);
    expect(result).toEqual(employee);
  });

  it('updates an employee with PUT', () => {
    service.update('abc', input).subscribe();
    const request = http.expectOne(`${url}/abc`);
    request.flush({ data: employee });

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(input);
  });

  it('deletes an employee with DELETE', () => {
    service.delete('abc').subscribe();
    const request = http.expectOne(`${url}/abc`);
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(request.request.method).toBe('DELETE');
  });
});
