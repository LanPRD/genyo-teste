import { AbstractControl, ValidationErrors } from '@angular/forms';
import moment from 'moment';

export function trimmedRequired(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

export function noDigits(control: AbstractControl): ValidationErrors | null {
  return /\d/.test(String(control.value ?? '')) ? { hasDigits: true } : null;
}

function isBefore(value: string, other: string, format: string): boolean {
  const a = moment.utc(value, format, true);
  const b = moment.utc(other, format, true);

  return a.isValid() && b.isValid() && a.isBefore(b);
}

// Regras que cruzam campos: a demissão não pode ser anterior à admissão e o fim
// do expediente não pode ser anterior ao início.
export function employeeRules(group: AbstractControl): ValidationErrors | null {
  const { hireDate, terminationDate, workdayStartTime, workdayEndTime } = group.value as Record<
    string,
    string
  >;
  const errors: ValidationErrors = {};

  if (hireDate && terminationDate && isBefore(terminationDate, hireDate, 'YYYY-MM-DD')) {
    errors['terminationBeforeHire'] = true;
  }

  if (workdayStartTime && workdayEndTime && isBefore(workdayEndTime, workdayStartTime, 'HH:mm')) {
    errors['endBeforeStart'] = true;
  }

  return Object.keys(errors).length ? errors : null;
}
