/* extensions */
export {}
declare global {
  interface String {
    formatNationalCode(format?: string, locale?: string): string;
    toNationalCode(): string | undefined;
  }
}
