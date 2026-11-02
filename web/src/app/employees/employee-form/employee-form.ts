import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { calculateDailyHours, calculateWorkedDays } from '../../core/calculations';
import { formatDate, toDateInput } from '../../core/dates';
import {
  ApiErrorBody,
  CLOSING_PERIODICITIES,
  ClosingPeriodicity,
  EmployeeInput,
  periodicityLabel,
} from '../../core/employee.model';
import { EmployeeService } from '../../core/employee.service';
import { FlashMessageService } from '../../core/flash-message.service';
import { employeeRules, noDigits, trimmedRequired } from '../../core/validators';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';

type FieldName =
  | 'name'
  | 'hireDate'
  | 'terminationDate'
  | 'workdayStartTime'
  | 'workdayEndTime'
  | 'closingPeriodicity';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule, RouterLink, ConfirmModal],
  templateUrl: './employee-form.html',
})
export class EmployeeForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EmployeeService);
  private readonly flash = inject(FlashMessageService);
  private readonly router = inject(Router);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');

  protected readonly isEdit = this.id !== null;
  protected readonly periodicities = CLOSING_PERIODICITIES;

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [trimmedRequired, noDigits]],
      hireDate: ['', Validators.required],
      terminationDate: [''],
      workdayStartTime: ['', Validators.required],
      workdayEndTime: ['', Validators.required],
      closingPeriodicity: ['' as ClosingPeriodicity | '', Validators.required],
    },
    { validators: employeeRules },
  );

  private readonly values = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  // 3.5: só calcula quando há data de demissão; 3.6: horas por dia.
  protected readonly workedDays = computed(() =>
    calculateWorkedDays(this.values().hireDate, this.values().terminationDate),
  );
  protected readonly dailyHours = computed(() =>
    calculateDailyHours(this.values().workdayStartTime, this.values().workdayEndTime),
  );

  protected readonly summary = computed(() => {
    const value = this.values();

    return {
      name: value.name.trim(),
      hireDate: formatDate(value.hireDate),
      terminationDate: value.terminationDate ? formatDate(value.terminationDate) : 'Em atividade',
      workdayStartTime: value.workdayStartTime,
      workdayEndTime: value.workdayEndTime,
      closingPeriodicity: periodicityLabel(value.closingPeriodicity),
    };
  });

  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly serverError = signal<string | null>(null);
  protected readonly confirming = signal(false);
  protected readonly saving = signal(false);

  constructor() {
    if (this.id) {
      this.loadEmployee(this.id);
    }
  }

  protected fieldError(name: FieldName): string | null {
    const control = this.form.controls[name];

    if (!control.touched && !control.dirty) {
      return null;
    }

    const errors = control.errors;

    if (errors?.['required']) {
      return 'Campo obrigatório.';
    }

    if (errors?.['hasDigits']) {
      return 'O nome não pode conter números.';
    }

    if (errors?.['server']) {
      return errors['server'] as string;
    }

    if (name === 'terminationDate' && this.form.hasError('terminationBeforeHire')) {
      return 'A data de demissão não pode ser anterior à data de admissão.';
    }

    if (name === 'workdayEndTime' && this.form.hasError('endBeforeStart')) {
      return 'A hora de fim do expediente não pode ser anterior à hora de início.';
    }

    return null;
  }

  // Valida e, estando tudo certo, pede a confirmação antes de salvar.
  protected review(): void {
    this.serverError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.confirming.set(true);
  }

  protected cancelConfirmation(): void {
    this.confirming.set(false);
  }

  protected confirmSave(): void {
    const input = this.buildInput();
    const request = this.id ? this.service.update(this.id, input) : this.service.create(input);

    this.saving.set(true);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.confirming.set(false);
        this.flash.show({
          type: 'success',
          text: this.isEdit ? `${input.name} foi atualizado.` : `${input.name} foi cadastrado.`,
        });
        void this.router.navigate(['/employees']);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.confirming.set(false);
        this.showServerError(error);
      },
    });
  }

  private buildInput(): EmployeeInput {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      hireDate: value.hireDate,
      ...(value.terminationDate ? { terminationDate: value.terminationDate } : {}),
      workdayStartTime: value.workdayStartTime,
      workdayEndTime: value.workdayEndTime,
      closingPeriodicity: value.closingPeriodicity as ClosingPeriodicity,
    };
  }

  private loadEmployee(id: string): void {
    this.loading.set(true);

    this.service.get(id).subscribe({
      next: (employee) => {
        this.form.patchValue({
          name: employee.name,
          hireDate: toDateInput(employee.hireDate),
          terminationDate: toDateInput(employee.terminationDate),
          workdayStartTime: employee.workdayStartTime,
          workdayEndTime: employee.workdayEndTime,
          closingPeriodicity: employee.closingPeriodicity,
        });
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loadError.set(
          error.status === 404
            ? 'Funcionário não encontrado.'
            : 'Não foi possível carregar o funcionário. Verifique se a API está no ar.',
        );
        this.loading.set(false);
      },
    });
  }

  // Erros 400 da API trazem o campo; mostramos no próprio campo e num resumo.
  private showServerError(error: HttpErrorResponse): void {
    const body = error.error as ApiErrorBody | null;

    if (error.status === 400 && body?.details?.length) {
      for (const detail of body.details) {
        this.form.get(detail.field)?.setErrors({ server: detail.message });
      }

      this.form.markAllAsTouched();
      this.serverError.set('A API recusou os dados. Corrija os campos destacados.');

      return;
    }

    this.serverError.set(
      error.status === 404
        ? 'Funcionário não encontrado. Ele pode ter sido excluído.'
        : 'Não foi possível salvar. Tente novamente.',
    );
  }
}
