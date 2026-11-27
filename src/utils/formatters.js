export const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

export const today = () => new Date().toISOString().split('T')[0];

export const nightsBetween = (from, to) => {
  if (!from || !to) return 0;
  const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
  return diff > 0 ? Math.round(diff) : 0;
};