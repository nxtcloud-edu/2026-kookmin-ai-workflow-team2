export function normalizeMessage(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{Script=Hangul}\p{Letter}\p{Number}]+/gu, "");
}

export function normalizedIncludes(message: string, keyword: string): boolean {
  return normalizeMessage(message).includes(normalizeMessage(keyword));
}
