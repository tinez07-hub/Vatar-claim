export const MAX_CLAIM_AMOUNT = 5_000_000_000_000;

const amountFormatter = new Intl.NumberFormat('en-US');

export function formatAmount(value: number | string) {
  return amountFormatter.format(Number(value));
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
