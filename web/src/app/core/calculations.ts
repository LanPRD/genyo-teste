import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';

// Total de dias corridos entre a admissão e a demissão, contando os dois dias.
// Sem demissão (ou com datas inválidas) não há cálculo.
export function calculateWorkedDays(
  hireDate: string | null | undefined,
  terminationDate: string | null | undefined,
): number | null {
  if (!hireDate || !terminationDate) {
    return null;
  }

  const hire = moment.utc(hireDate, DATE_FORMAT, true);
  const termination = moment.utc(terminationDate, DATE_FORMAT, true);

  if (!hire.isValid() || !termination.isValid() || termination.isBefore(hire)) {
    return null;
  }

  return termination.diff(hire, 'days') + 1;
}

// Horas trabalhadas por dia, no mesmo dia e sem intervalos, como "9h 30min".
export function calculateDailyHours(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  if (!start || !end) {
    return null;
  }

  const startTime = moment.utc(start, TIME_FORMAT, true);
  const endTime = moment.utc(end, TIME_FORMAT, true);

  if (!startTime.isValid() || !endTime.isValid() || endTime.isBefore(startTime)) {
    return null;
  }

  const minutes = endTime.diff(startTime, 'minutes');

  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}
