import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Employee } from '../../core/employee.model';
import { FlashMessageService } from '../../core/flash-message.service';
import { EmployeeForm } from './employee-form';

const url = `${environment.apiUrl}/employees`;

const validValues = {
  name: 'Maria da Silva',
  hireDate: '2026-01-10',
  workdayStartTime: '08:00',
  workdayEndTime: '17:00',
  closingPeriodicity: 'MONTHLY',
};

const storedEmployee: Employee = {
  id: 'abc',
  name: 'Maria da Silva',
  closingPeriodicity: 'QUARTERLY',
  hireDate: '2026-01-10T00:00:00.000Z',
  terminationDate: '2026-12-31T00:00:00.000Z',
  workdayStartTime: '09:00',
  workdayEndTime: '18:00',
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
};

describe('EmployeeForm', () => {
  let fixture: ComponentFixture<EmployeeForm>;
  let http: HttpTestingController;
  let root: HTMLElement;

  function configure(routeId: string | null) {
    TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(routeId ? { id: routeId } : {}) } },
        },
      ],
    });

    http = TestBed.inject(HttpTestingController);
  }

  async function open() {
    fixture = TestBed.createComponent(EmployeeForm);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  }

  async function fill(values: Record<string, string>) {
    for (const [name, value] of Object.entries(values)) {
      const element = root.querySelector<HTMLInputElement | HTMLSelectElement>(
        `[formControlName="${name}"]`,
      )!;

      element.value = value;
      element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input'));
    }

    await fixture.whenStable();
  }

  async function submit() {
    root.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  }

  function modalButton(label: string) {
    return Array.from(root.querySelectorAll<HTMLButtonElement>('.modal-footer button')).find((b) =>
      b.textContent?.includes(label),
    )!;
  }

  function value(name: string) {
    return root.querySelector<HTMLInputElement | HTMLSelectElement>(`[formControlName="${name}"]`)!
      .value;
  }

  afterEach(() => {
    http.verify();
  });

  describe('creating', () => {
    beforeEach(async () => {
      configure(null);
      await open();
    });

    it('shows the required errors and does not ask for confirmation on an empty form', async () => {
      await submit();

      expect(root.querySelectorAll('.invalid-feedback')).toBeDefined();
      expect(root.textContent).toContain('Campo obrigatório.');
      expect(root.querySelector('.modal')).toBeNull();
    });

    it('rejects a name with numbers', async () => {
      await fill({ ...validValues, name: 'Maria 2' });
      await submit();

      expect(root.textContent).toContain('O nome não pode conter números.');
      expect(root.querySelector('.modal')).toBeNull();
    });

    it('rejects a termination date before the hire date', async () => {
      await fill({ ...validValues, terminationDate: '2026-01-09' });
      await submit();

      expect(root.textContent).toContain(
        'A data de demissão não pode ser anterior à data de admissão.',
      );
      expect(root.querySelector('.modal')).toBeNull();
    });

    it('rejects an end time before the start time', async () => {
      await fill({ ...validValues, workdayStartTime: '17:00', workdayEndTime: '08:00' });
      await submit();

      expect(root.textContent).toContain(
        'A hora de fim do expediente não pode ser anterior à hora de início.',
      );
      expect(root.querySelector('.modal')).toBeNull();
    });

    it('shows the worked days only when there is a termination date', async () => {
      await fill({ hireDate: '2026-01-10' });

      expect(root.querySelector('[data-testid="worked-days"]')).toBeNull();

      await fill({ terminationDate: '2026-01-12' });

      expect(root.querySelector('[data-testid="worked-days"]')?.textContent).toContain('3');

      await fill({ terminationDate: '' });

      expect(root.querySelector('[data-testid="worked-days"]')).toBeNull();
    });

    it('shows the daily hours from the start and end times', async () => {
      await fill({ workdayStartTime: '08:00', workdayEndTime: '17:30' });

      expect(root.querySelector('[data-testid="daily-hours"]')?.textContent).toContain('9h 30min');
    });

    it('asks for confirmation with the entered data before saving', async () => {
      await fill(validValues);
      await submit();

      const summary = root.querySelector('.modal [data-testid="summary"]')?.textContent;

      expect(root.querySelector('.modal-title')?.textContent).toContain('Confirmar cadastro');
      expect(summary).toContain('Maria da Silva');
      expect(summary).toContain('10/01/2026');
      expect(summary).toContain('Em atividade');
      expect(summary).toContain('08:00 às 17:00');
      expect(summary).toContain('Mensal');
      http.expectNone(url);
    });

    it('does not save when the confirmation is cancelled', async () => {
      await fill(validValues);
      await submit();

      modalButton('Cancelar').click();
      await fixture.whenStable();

      expect(root.querySelector('.modal')).toBeNull();
      http.expectNone(url);
    });

    it('saves after the confirmation, leaves a message and goes back to the list', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      await fill(validValues);
      await submit();

      modalButton('Confirmar').click();
      const request = http.expectOne(url);
      request.flush({ data: storedEmployee });
      await fixture.whenStable();

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(validValues);
      expect(navigate).toHaveBeenCalledWith(['/employees']);
      expect(TestBed.inject(FlashMessageService).take()).toEqual({
        type: 'success',
        text: 'Maria da Silva foi cadastrado.',
      });
    });

    it('sends the termination date when it is filled', async () => {
      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      await fill({ ...validValues, terminationDate: '2026-12-31' });
      await submit();

      modalButton('Confirmar').click();
      const request = http.expectOne(url);
      request.flush({ data: storedEmployee });

      expect(request.request.body).toEqual({ ...validValues, terminationDate: '2026-12-31' });
    });

    it('shows the fields rejected by the API', async () => {
      await fill(validValues);
      await submit();

      modalButton('Confirmar').click();
      http.expectOne(url).flush(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid employee data',
          details: [{ field: 'name', message: 'Name must not contain numbers' }],
        },
        { status: 400, statusText: 'Bad Request' },
      );
      await fixture.whenStable();

      expect(root.querySelector('.modal')).toBeNull();
      expect(root.querySelector('.alert-danger')?.textContent).toContain('A API recusou os dados');
      expect(root.textContent).toContain('Name must not contain numbers');
    });

    it('shows a generic error when the API is unavailable', async () => {
      await fill(validValues);
      await submit();

      modalButton('Confirmar').click();
      http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
      await fixture.whenStable();

      expect(root.querySelector('.alert-danger')?.textContent).toContain('Não foi possível salvar');
    });
  });

  describe('editing', () => {
    it('prefills the form with the current data', async () => {
      configure('abc');
      await open();
      http.expectOne(`${url}/abc`).flush({ data: storedEmployee });
      await fixture.whenStable();

      expect(root.querySelector('h1')?.textContent).toContain('Editar funcionário');
      expect(value('name')).toBe('Maria da Silva');
      expect(value('hireDate')).toBe('2026-01-10');
      expect(value('terminationDate')).toBe('2026-12-31');
      expect(value('workdayStartTime')).toBe('09:00');
      expect(value('workdayEndTime')).toBe('18:00');
      expect(value('closingPeriodicity')).toBe('QUARTERLY');
      expect(root.querySelector('[data-testid="worked-days"]')?.textContent).toContain('356');
    });

    it('applies the same rules as the registration', async () => {
      configure('abc');
      await open();
      http.expectOne(`${url}/abc`).flush({ data: storedEmployee });
      await fixture.whenStable();

      await fill({ name: 'Maria 2' });
      await submit();

      expect(root.textContent).toContain('O nome não pode conter números.');
      expect(root.querySelector('.modal')).toBeNull();
    });

    it('asks for confirmation with the updated data and sends a PUT', async () => {
      configure('abc');
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      await open();
      http.expectOne(`${url}/abc`).flush({ data: storedEmployee });
      await fixture.whenStable();

      await fill({ name: 'Ana Souza', terminationDate: '' });
      await submit();

      expect(root.querySelector('.modal-title')?.textContent).toContain('Confirmar alterações');
      expect(root.querySelector('.modal [data-testid="summary"]')?.textContent).toContain(
        'Ana Souza',
      );
      http.expectNone(`${url}/abc`);

      modalButton('Confirmar').click();
      const request = http.expectOne(`${url}/abc`);
      request.flush({ data: storedEmployee });
      await fixture.whenStable();

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual({
        name: 'Ana Souza',
        hireDate: '2026-01-10',
        workdayStartTime: '09:00',
        workdayEndTime: '18:00',
        closingPeriodicity: 'QUARTERLY',
      });
      expect(navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('shows a message when the employee does not exist', async () => {
      configure('missing');
      await open();
      http.expectOne(`${url}/missing`).flush(null, { status: 404, statusText: 'Not Found' });
      await fixture.whenStable();

      expect(root.querySelector('.alert-danger')?.textContent).toContain(
        'Funcionário não encontrado.',
      );
      expect(root.querySelector('form')).toBeNull();
    });
  });
});
