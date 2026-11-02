import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Employee } from '../../core/employee.model';
import { FlashMessageService } from '../../core/flash-message.service';
import { EmployeeList } from './employee-list';

const url = `${environment.apiUrl}/employees`;

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 'aaaaaaaa-1111-2222-3333-444444444444',
    name: 'Maria da Silva',
    closingPeriodicity: 'MONTHLY',
    hireDate: '2026-01-10T00:00:00.000Z',
    terminationDate: null,
    workdayStartTime: '08:00',
    workdayEndTime: '17:00',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

function page(data: Employee[], nextCursor: string | null = null) {
  return { data, meta: { limit: 10, nextCursor } };
}

describe('EmployeeList', () => {
  let fixture: ComponentFixture<EmployeeList>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  async function create(firstPage = page([makeEmployee()])) {
    fixture = TestBed.createComponent(EmployeeList);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.expectOne((r) => r.url === url && r.method === 'GET').flush(firstPage);
    await fixture.whenStable();
  }

  function button(label: string) {
    return Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label),
    ) as HTMLButtonElement;
  }

  it('shows a message when there are no employees', async () => {
    await create(page([]));

    expect(root.textContent).toContain('Nenhum funcionário cadastrado.');
    expect(root.querySelector('table')).toBeNull();
  });

  it('lists name, short id, dates and periodicity of each employee', async () => {
    await create(
      page([
        makeEmployee(),
        makeEmployee({
          id: 'bbbbbbbb-1111-2222-3333-444444444444',
          name: 'João Pereira',
          hireDate: '2025-03-01T00:00:00.000Z',
          terminationDate: '2026-06-30T00:00:00.000Z',
          closingPeriodicity: 'QUARTERLY',
        }),
      ]),
    );

    const rows = Array.from(root.querySelectorAll('tbody tr')).map((row) => row.textContent);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain('Maria da Silva');
    expect(rows[0]).toContain('ID aaaaaaaa');
    expect(rows[0]).toContain('10/01/2026');
    expect(rows[0]).toContain('Em atividade');
    expect(rows[0]).toContain('Mensal');
    expect(rows[1]).toContain('João Pereira');
    expect(rows[1]).toContain('01/03/2025');
    expect(rows[1]).toContain('30/06/2026');
    expect(rows[1]).toContain('Trimestral');
  });

  it('links each employee to the edit screen', async () => {
    await create();

    const link = root.querySelector('tbody a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/employees/aaaaaaaa-1111-2222-3333-444444444444/edit');
  });

  it('loads the next page from the cursor and appends it', async () => {
    await create(page([makeEmployee()], 'cursor-1'));

    button('Carregar mais').click();
    const request = http.expectOne((r) => r.url === url && r.method === 'GET');
    request.flush(page([makeEmployee({ id: 'cccccccc-1', name: 'Ana Souza' })], null));
    await fixture.whenStable();

    expect(request.request.params.get('cursor')).toBe('cursor-1');
    expect(root.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(button('Carregar mais')).toBeUndefined();
  });

  it('shows an error and retries the request', async () => {
    fixture = TestBed.createComponent(EmployeeList);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.expectOne((r) => r.url === url).flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(root.querySelector('.alert-danger')?.textContent).toContain(
      'Não foi possível carregar os funcionários',
    );

    button('Tentar novamente').click();
    http.expectOne((r) => r.url === url).flush(page([makeEmployee()]));
    await fixture.whenStable();

    expect(root.querySelector('.alert-danger')).toBeNull();
    expect(root.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('asks for confirmation naming the employee before deleting', async () => {
    await create();

    button('Excluir').click();
    await fixture.whenStable();

    expect(root.querySelector('.modal-body')?.textContent).toContain('Maria da Silva');
    http.expectNone((r) => r.method === 'DELETE');
  });

  it('keeps the employee when the deletion is cancelled', async () => {
    await create();
    button('Excluir').click();
    await fixture.whenStable();

    button('Cancelar').click();
    await fixture.whenStable();

    expect(root.querySelector('.modal')).toBeNull();
    expect(root.querySelectorAll('tbody tr')).toHaveLength(1);
    http.expectNone((r) => r.method === 'DELETE');
  });

  it('deletes after confirmation and refreshes the list', async () => {
    await create();
    button('Excluir').click();
    await fixture.whenStable();

    root.querySelector<HTMLButtonElement>('.modal-footer .btn-danger')!.click();
    http
      .expectOne(`${url}/aaaaaaaa-1111-2222-3333-444444444444`)
      .flush(null, { status: 204, statusText: 'No Content' });
    http.expectOne((r) => r.url === url && r.method === 'GET').flush(page([]));
    await fixture.whenStable();

    expect(root.querySelector('.modal')).toBeNull();
    expect(root.querySelector('.alert-success')?.textContent).toContain(
      'Maria da Silva foi excluído.',
    );
    expect(root.textContent).toContain('Nenhum funcionário cadastrado.');
  });

  it('reports a failed deletion without touching the list', async () => {
    await create();
    button('Excluir').click();
    await fixture.whenStable();

    root.querySelector<HTMLButtonElement>('.modal-footer .btn-danger')!.click();
    http
      .expectOne(`${url}/aaaaaaaa-1111-2222-3333-444444444444`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    http.expectOne((r) => r.url === url && r.method === 'GET').flush(page([makeEmployee()]));
    await fixture.whenStable();

    expect(root.querySelector('.alert-danger')?.textContent).toContain('Não foi possível excluir');
    expect(root.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('shows the message left by another screen', async () => {
    TestBed.inject(FlashMessageService).show({ type: 'success', text: 'Ana foi cadastrada.' });

    await create();

    expect(root.querySelector('.alert-success')?.textContent).toContain('Ana foi cadastrada.');
  });
});
