/* extensions */
export {}
declare global {
  interface String {
    formatPhone(national?: boolean, locale?: string): string;
    sanitizeMobile(countryCode?: string): string | undefined;
  }
}
