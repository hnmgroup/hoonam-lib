/* extensions */
export {}
declare global {
  interface String {
    formatPhone(format?: string, locale?: string): string;
    toPhone(countryCode?: string): string | undefined;
    toTelephone(countryCode?: string): string | undefined;
    toMobile(countryCode?: string): string | undefined;
  }
}
