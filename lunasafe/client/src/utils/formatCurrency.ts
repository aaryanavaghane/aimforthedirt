/**
 * Formats monetary amounts in Indian Rupee (INR - ₹) with Lakh / Crore shorthand or Indian locale commas.
 */
export function formatInr(amount: number, options?: { compact?: boolean; precision?: number }): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  const precision = options?.precision ?? 2;
  const isCompact = options?.compact ?? true;

  if (isCompact) {
    if (Math.abs(amount) >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr.toFixed(precision)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      const lakh = amount / 100000;
      return `₹${lakh.toFixed(precision)} Lakh`;
    }
    if (Math.abs(amount) >= 1000) {
      const k = amount / 1000;
      return `₹${k.toFixed(1)}k`;
    }
  }

  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatInrFull(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
