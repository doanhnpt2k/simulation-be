export function normalizeCode(code: string): string {
  return code.split('').sort().join('');
}

export function isEqual(code1: string, code2: string): boolean {
  return normalizeCode(code1) === normalizeCode(code2);
}
