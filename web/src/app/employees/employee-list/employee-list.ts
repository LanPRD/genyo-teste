import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../core/dates';
import { Employee, periodicityLabel } from '../../core/employee.model';
import { EmployeeService } from '../../core/employee.service';
import { FlashMessage, FlashMessageService } from '../../core/flash-message.service';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink, ConfirmModal],
  templateUrl: './employee-list.html',
})
export class EmployeeList {
  private readonly service = inject(EmployeeService);
  private readonly flash = inject(FlashMessageService);

  protected readonly formatDate = formatDate;
  protected readonly periodicityLabel = periodicityLabel;

  protected readonly employees = signal<Employee[]>([]);
  protected readonly nextCursor = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly loaded = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly message = signal<FlashMessage | null>(this.flash.take());
  protected readonly employeeToDelete = signal<Employee | null>(null);
  protected readonly deleting = signal(false);

  constructor() {
    this.load(true);
  }

  protected load(reset = false): void {
    const cursor = reset ? undefined : (this.nextCursor() ?? undefined);

    this.loading.set(true);
    this.loadError.set(null);

    this.service.list(cursor).subscribe({
      next: (page) => {
        this.employees.update((current) => (reset ? page.data : [...current, ...page.data]));
        this.nextCursor.set(page.meta.nextCursor);
        this.loading.set(false);
        this.loaded.set(true);
      },
      error: () => {
        this.loadError.set(
          'Não foi possível carregar os funcionários. Verifique se a API está no ar.',
        );
        this.loading.set(false);
      },
    });
  }

  protected askDelete(employee: Employee): void {
    this.employeeToDelete.set(employee);
  }

  protected cancelDelete(): void {
    this.employeeToDelete.set(null);
  }

  protected confirmDelete(): void {
    const employee = this.employeeToDelete();

    if (!employee) {
      return;
    }

    this.deleting.set(true);

    this.service.delete(employee.id).subscribe({
      next: () => {
        this.finishDelete({ type: 'success', text: `${employee.name} foi excluído.` });
      },
      error: (error: HttpErrorResponse) => {
        const text =
          error.status === 404
            ? `${employee.name} já não existe.`
            : 'Não foi possível excluir o funcionário. Tente novamente.';

        this.finishDelete({ type: 'danger', text });
      },
    });
  }

  protected dismissMessage(): void {
    this.message.set(null);
  }

  // Recarrega do início: o cursor da página atual pode apontar para um registro
  // que acabou de ser excluído.
  private finishDelete(message: FlashMessage): void {
    this.deleting.set(false);
    this.employeeToDelete.set(null);
    this.message.set(message);
    this.load(true);
  }
}
