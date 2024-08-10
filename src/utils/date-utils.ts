import moment from "moment";
import momentz from "moment-timezone";
import jMoment from "jalali-moment";
import {isAbsent, isNullOrUndefined, Optional, StringMap} from "@/utils/core-utils";
import {formatNumber} from "@/utils/num-utils";
import {PERSIAN_LOCALE, resolveLocale} from "@/i18n";
import {isNaN} from "lodash-es";

export enum WeekDay {
  Sunday    = 0,
  Monday    = 1,
  Tuesday   = 2,
  Wednesday = 3,
  Thursday  = 4,
  Friday    = 5,
  Saturday  = 6,
}

export function sanitizeDate(value: any): Optional<Date> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  return date;
}

export function now(): Date {
  return new Date();
}

export function today(): Date {
  return startTimeOfDay(now());
}

export function compareDates(date1: Optional<Date>, date2: Optional<Date>): number {
  date1 = date1?.sanitize();
  date2 = date2?.sanitize();

  if (isAbsent(date1)) return isAbsent(date2) ? 0 : -1;
  if (isAbsent(date2)) return isAbsent(date1) ? 0 : 1;

  const [t1, t2] = [date1.getTime(), date2.getTime()];
  return t1 > t2 ? 1 : (t1 < t2 ? -1 : 0);
}

export function time(hour?: number, min?: number, sec?: number, ms?: number): Date {
  return getTime(withTime(now(), hour, min, sec, ms));
}

export function addYears(date: Date, value: number): Date {
  if (isAbsent(date)) return date;
  return moment(new Date(date)).add(value, "year").toDate();
}

export function addDays(date: Date, value: number): Date {
  if (isAbsent(date)) return date;
  return moment(new Date(date)).add(value, "day").toDate();
}

export function addHours(date: Date, value: number): Date {
  if (isAbsent(date)) return date;
  return moment(new Date(date)).add(value, "hour").toDate();
}

export function lastTimeOfDay(date: Date): Date {
  return withTime(date, 23, 59, 59, 999);
}

export function startTimeOfDay(date: Date): Date {
  return withTime(date, 0, 0, 0, 0);
}

function getHour12(hour: number): number {
  if (hour == 0) return 12;
  if (hour <= 12) return hour;
  return hour - 12;
}

export function isToday(date: Date): boolean {
  return moment(date.sanitize().dateOnly()).isSame(today());
}

export function isTomorrow(date: Date): boolean {
  return moment(date.sanitize().dateOnly()).isSame(today().addDays(1));
}

export function withTime(date: Date, hour?: number, min?: number, sec?: number, ms?: number): Date {
  if (isAbsent(date)) return date;

  date = new Date(date);
  date.setHours(hour ?? date.getHours(), min, sec, ms);
  return date;
}

export function withDate(date: Date, year?: number, month?: number, day?: number): Date {
  if (isAbsent(date)) return date;

  date = new Date(date);
  date.setFullYear(year ?? date.getFullYear(), month, day);
  return date;
}

export function withoutTime(date: Date): Date {
  return withTime(date, 0, 0, 0, 0);
}

export function getTime(date: Date): Date {
  return withDate(date, 1970, 0, 1);
}

export function getSystemTimezone(): string {
  return momentz.tz.guess(true) ?? "UTC";
}

/** timezone offset in minutes */
export function getTimezoneOffsetValue(timezone?: string): number {
  return momentz.tz(timezone ?? getSystemTimezone()).utcOffset();
}

export function getTimezoneOffset(timezone?: string): string {
  const tz = momentz.tz(timezone ?? getSystemTimezone());
  const offset = getTimezoneOffsetValue(timezone);
  return offset === 0 ? "Z" : tz.format("Z");
}

export function toTimezone(date: Date, timezone: string): Date {
  return momentz.tz({
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  }, timezone).toDate();
}

function getDateSeparator(locale: string): Optional<string> {
  const date = new Date(2000, 0, 1);
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const separator = parts.find(part => part.type === "literal");

  return separator?.value ?? undefined;
}

function getTimeSeparator(locale: string): Optional<string> {
  const date = new Date(2000, 0, 1, 13, 30, 45);
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const separator = parts.find(part => part.type === "literal");

  return separator?.value ?? undefined;
}

export function parsePersianDate(date: string): Date {
  const m = jMoment(date, "jYYYY/jMM/jDD");
  return m.toDate();
}

export function formatDate(date: Date, format?: string, locale?: string): string {
  const localeInfo = resolveLocale(locale);
  format ??= "yyyy/MM/dd HH:mm:ss";
  const zero = formatNumber(0, undefined, locale);

  const formatters: StringMap<(date: Date) => string> = {
    G: (date) => date.getFullYear() > 0 ? "AD" : "BC",

    yyyy: (date) => new Intl.DateTimeFormat(localeInfo.name, { year: "numeric" }).format(date).padStart(4, zero),
    yy: (date) => new Intl.DateTimeFormat(localeInfo.name, { year: "2-digit" }).format(date),
    y: (date) => new Intl.DateTimeFormat(localeInfo.name, { year: "numeric" }).format(date),

    MMMM: (date) => new Intl.DateTimeFormat(localeInfo.name, { month: "long" }).format(date),
    MMM: (date) => new Intl.DateTimeFormat(localeInfo.name, { month: "short" }).format(date),
    MM: (date) => new Intl.DateTimeFormat(localeInfo.name, { month: "numeric" }).format(date).padStart(2, zero),
    M: (date) => new Intl.DateTimeFormat(localeInfo.name, { month: "numeric" }).format(date),

    dd: (date) => new Intl.DateTimeFormat(localeInfo.name, { day: "numeric" }).format(date).padStart(2, zero),
    d: (date) => new Intl.DateTimeFormat(localeInfo.name, { day: "numeric" }).format(date),

    EEEE: (date) => new Intl.DateTimeFormat(localeInfo.name, { weekday: "long" }).format(date),
    E: (date) => new Intl.DateTimeFormat(localeInfo.name, { weekday: "short" }).format(date),

    HH: (date) => new Intl.DateTimeFormat(localeInfo.name, { hour: "numeric", hour12: false }).format(date).padStart(2, zero),
    H: (date) => new Intl.DateTimeFormat(localeInfo.name, { hour: "numeric", hour12: false }).format(date),

    hh: (date) => new Intl.DateTimeFormat(localeInfo.name, { hour: "numeric", hour12: true }).format(date).padStart(2, zero),
    h: (date) => new Intl.DateTimeFormat(localeInfo.name, { hour: "numeric", hour12: true }).format(date),

    mm: (date) => new Intl.DateTimeFormat(localeInfo.name, { minute: "numeric" }).format(date).padStart(2, zero),
    m: (date) => new Intl.DateTimeFormat(localeInfo.name, { minute: "numeric" }).format(date),

    ss: (date) => new Intl.DateTimeFormat(localeInfo.name, { second: "numeric" }).format(date).padStart(2, zero),
    s: (date) => new Intl.DateTimeFormat(localeInfo.name, { second: "numeric" }).format(date),

    SSS: (date) => formatNumber(date.getMilliseconds(), "d3", locale),
    S: (date) => formatNumber(date.getMilliseconds(), "d", locale),

    a: (date) => new Intl.DateTimeFormat(localeInfo.name, { hour: "numeric", hour12: true }).format(date).split(" ")[1],

    zzzz: (date) => new Intl.DateTimeFormat(localeInfo.name, { timeZoneName: "long" }).format(date).split(" ").pop() ?? "",
    z: (date) => new Intl.DateTimeFormat(localeInfo.name, { timeZoneName: "short" }).format(date).split(" ").pop() ?? "",

    "/": () => getDateSeparator(locale),
    ":": () => getTimeSeparator(locale),
  };

  return format.replace(
    /(\\|'|"?)(G|yyyy|yy|y|MMMM|MMM|MM|M|dd|d|EEEE|E|HH|H|hh|h|mm|m|ss|s|SSS|S|a|zzzz|z|\/|:)('|"?)/g,
    (raw: string, esc: Optional<string>, formatter: string, escC: Optional<string>) => {
      if (esc == "\\") return raw.substring(1);
      if ((esc == "'" || esc == '"') && escC == esc) return raw.substring(1, raw.length - 1);
      return formatters[formatter]?.(date) ?? raw;
    },
  );
}

/* extensions */

Date.prototype.sanitize = function (): Date {
  return new Date(this);
};

Date.prototype.dateOnly = function (): Date {
  return withoutTime(this);
};

Date.prototype.toTime = function (): Date {
  return this.sanitize().timeOnly();
};

Date.prototype.timeOnly = function (): Date {
  return getTime(this);
};

Date.prototype.weekday = function (): WeekDay {
  switch (this.getDay()) {
    case 0: return WeekDay.Sunday;
    case 1: return WeekDay.Monday;
    case 2: return WeekDay.Tuesday;
    case 3: return WeekDay.Wednesday;
    case 4: return WeekDay.Thursday;
    case 5: return WeekDay.Friday;
    case 6: return WeekDay.Saturday;
  }
};

Date.prototype.addDays = function (days: number): Date {
  return addDays(this, days);
};

Date.prototype.addHours = function (hours: number): Date {
  return addHours(this, hours);
};

Date.prototype.withTime = function (hour?: number, min?: number, sec?: number, ms?: number): Date {
  return withTime(this, hour, min, sec, ms);
};

Date.prototype.firstTimeOfDay = function (): Date {
  return withoutTime(this);
};

Date.prototype.lastTimeOfDay = function (): Date {
  return lastTimeOfDay(this);
};

Date.prototype.format = function (format?: string, locale?: string): string {
  return formatDate(this, format, locale);
};

Date.prototype.equals = function (other: Optional<Date>): boolean {
  return compareDates(this, other) === 0;
};

Date.prototype.toTimezone = function (timezone: string): Date {
  return toTimezone(this, timezone);
};

Date.prototype.toPersianTimezone = function (): Date {
  return toTimezone(this, PERSIAN_LOCALE.dateTimeFormats.timezone);
};

String.prototype.toDate = function (): Optional<Date> {
  return sanitizeDate(this);
};
