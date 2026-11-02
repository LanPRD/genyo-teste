import moment from 'moment';

// As datas da API são meia-noite UTC; em UTC evitamos que o fuso mude o dia.
export function formatDate(value: string | null | undefined): string {
  return value ? moment.utc(value).format('DD/MM/YYYY') : '';
}

// Valor aceito por <input type="date">.
export function toDateInput(value: string | null | undefined): string {
  return value ? moment.utc(value).format('YYYY-MM-DD') : '';
}
