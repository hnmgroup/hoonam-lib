/* extensions */
export {}
declare global {
  interface String {
    formatPhone(countryCode?: string, national?: boolean): string;
    sanitizeMobile(countryCode?: string): string | undefined;
  }
}
