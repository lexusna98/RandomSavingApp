export function randomAvailableNumber(year: number, usedNumbers: number[]) {
  const isLeapYear = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);

  const max = isLeapYear ? 366 : 365;

  const allNumbers = Array.from({ length: max }, (_, i) => i + 1);

  const usedSet = new Set(usedNumbers);

  const available = allNumbers.filter((n) => !usedSet.has(n));

  if (available.length === 0) throw new Error('No numbers available');

  const index = Math.floor(Math.random() * available.length);

  return available[index];
}
