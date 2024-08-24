/* extensions */
export {}
declare global {
  interface String {
    formatPhone(format?: string, locale?: string): string;
    sanitizeMobile(countryCode?: string): string | undefined;
  }
}
