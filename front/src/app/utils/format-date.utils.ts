const MESES_ABR: Record<number, string> = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
};

export function formatDateIso(d: string): string {
  const parts = d.split('T')[0].split('-');
  const ano = Number(parts[0]);
  const mes = Number(parts[1]);
  const dia = Number(parts[2]);
  return `${dia} ${MESES_ABR[mes]}, ${ano}`;
}

export function formatDateBr(d: string): string {
  const [day, month, year] = d.split('/');
  return `${day} ${MESES_ABR[Number(month)] || ''}, ${year}`;
}
