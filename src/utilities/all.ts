export function hasDuplicateField<T, K extends keyof T>(
  arr: T[],
  field: K,
): boolean {
  const seen = new Set<T[K]>();
  for (const obj of arr) {
    const value = obj[field];
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }
  return false;
}
