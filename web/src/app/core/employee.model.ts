export const CLOSING_PERIODICITIES = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'BIMONTHLY', label: 'Bimestral' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'ANNUAL', label: 'Anual' },
] as const;

export type ClosingPeriodicity = (typeof CLOSING_PERIODICITIES)[number]['value'];

export function periodicityLabel(value: ClosingPeriodicity | ''): string {
  return CLOSING_PERIODICITIES.find((item) => item.value === value)?.label ?? '';
}

export interface Employee {
  id: string;
  name: string;
  closingPeriodicity: ClosingPeriodicity;
  hireDate: string;
  terminationDate: string | null;
  workdayStartTime: string;
  workdayEndTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name: string;
  hireDate: string;
  terminationDate?: string;
  workdayStartTime: string;
  workdayEndTime: string;
  closingPeriodicity: ClosingPeriodicity;
}

export interface EmployeePage {
  data: Employee[];
  meta: { limit: number; nextCursor: string | null };
}

export interface ApiErrorBody {
  error: string;
  message: string;
  details?: { field: string; message: string }[];
}
