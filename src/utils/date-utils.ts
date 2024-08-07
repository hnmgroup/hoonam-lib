import moment from "moment";
import momentz from "moment-timezone";
import jMoment from "jalali-moment";
import {isAbsent, isNullOrUndefined, Optional} from "@/utils/core-utils";
import {resolve} from "@/bind";
import {I18n} from "@/i18n";
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

export function withTimezone(date: Date, timezone: string): Date {
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
  // add escape char ' or " around formatter
  // add \ escape char for single char
  // add / and : for date and time separator char

  locale ??= resolve(I18n).locale.name;
  format ??= "yyyy/MM/dd HH:mm:ss.SSS";

  // if (locale == "fa") return formatDatePersian(date, format);

  const y = date.getFullYear().toString();
  const mon = (date.getMonth() + 1).toString();
  const d = date.getDate().toString();
  const H = date.getHours().toString();
  const h = getHour12(date.getHours()).toString();
  const min = date.getMinutes().toString().padStart(2, (0).format(locale));
  const s = date.getSeconds().toString().padStart(2, (0).format(locale));
  const ms = date.getMilliseconds().toString().padStart(3, (0).format(locale));

  let formatBuffer = format;

  formatBuffer = formatBuffer.replace(/yyyy/g, y.padStart(4, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/yyy/g, y.padStart(4, (0).format(locale)).substring(1));
  formatBuffer = formatBuffer.replace(/yy/g, y.padStart(4, (0).format(locale)).substring(2));
  formatBuffer = formatBuffer.replace(/y/g, y);

  formatBuffer = formatBuffer.replace(/MM/g, mon.padStart(2, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/M/g, mon);

  formatBuffer = formatBuffer.replace(/dd/g, d.padStart(2, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/d/g, d);

  formatBuffer = formatBuffer.replace(/HH/g, H.padStart(2, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/H/g, H);
  formatBuffer = formatBuffer.replace(/hh/g, h.padStart(2, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/h/g, h);

  formatBuffer = formatBuffer.replace(/mm/g, min.padStart(2, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/m/g, min);

  formatBuffer = formatBuffer.replace(/ss/g, s.padStart(2, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/s/g, s);

  formatBuffer = formatBuffer.replace(/SSS/g, ms.padStart(3, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/SS/g, ms.padStart(2, (0).format(locale)));
  formatBuffer = formatBuffer.replace(/S/g, ms);

  return formatBuffer.toString();
}

// export function formatDatePersian(date: Date, format?: string): string {
//   format ??= "yyyy/MM/dd HH:mm:ss.fff";
//
//   const persian = jMoment(new Date(date)).locale('fa');
//   const y = persian.year().toString();
//   const mon = (persian.month() + 1).toString();
//   const monthShortName = persian.format('MMM');
//   const monthName = persian.format('MMMM');
//   const d = persian.date().toString();
//   const weekdayShortName = persian.format('ddd');
//   const weekdayName = persian.format('dddd');
//   const H = persian.hours().toString();
//   const h = getHour12(persian.hours()).toString();
//   const min = persian.minutes().toString();
//   const s = persian.seconds().toString();
//   const ms = persian.milliseconds().toString();
//
//   let formatBuffer = format;
//
//   formatBuffer = formatBuffer.replace(/yyyy/igm, y.padStart(4, "0"));
//   formatBuffer = formatBuffer.replace(/yyy/igm, y.padStart(4, "0").substring(1));
//   formatBuffer = formatBuffer.replace(/yy/igm, y.padStart(4, "0").substring(2));
//   formatBuffer = formatBuffer.replace(/y/igm, y);
//
//   formatBuffer = formatBuffer.replace(/MMMM/gm, monthName);
//   formatBuffer = formatBuffer.replace(/MMM/gm, monthShortName);
//   formatBuffer = formatBuffer.replace(/MM/gm, mon.padStart(2, "0"));
//   formatBuffer = formatBuffer.replace(/M/gm, mon);
//
//   formatBuffer = formatBuffer.replace(/dddd/igm, weekdayName);
//   formatBuffer = formatBuffer.replace(/ddd/igm, weekdayShortName);
//   formatBuffer = formatBuffer.replace(/dd/igm, d.padStart(2, "0"));
//   formatBuffer = formatBuffer.replace(/d/igm, d);
//
//   formatBuffer = formatBuffer.replace(/HH/gm, H.padStart(2, "0"));
//   formatBuffer = formatBuffer.replace(/H/gm, H);
//   formatBuffer = formatBuffer.replace(/hh/gm, h.padStart(2, "0"));
//   formatBuffer = formatBuffer.replace(/h/gm, h);
//
//   formatBuffer = formatBuffer.replace(/mm/gm, min.padStart(2, "0"));
//   formatBuffer = formatBuffer.replace(/m/gm, min);
//
//   formatBuffer = formatBuffer.replace(/ss/igm, s.padStart(2, "0"));
//   formatBuffer = formatBuffer.replace(/s/igm, s);
//
//   formatBuffer = formatBuffer.replace(/fff/igm, ms.padStart(3, "0"));
//   formatBuffer = formatBuffer.replace(/f/igm, ms);
//
//   return formatBuffer.toString();
// }

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

Date.prototype.format = function (format?: string): string {
  return formatDate(this, format);
};

Date.prototype.equals = function (other: Optional<Date>): boolean {
  return compareDates(this, other) === 0;
};

Date.prototype.withPersianTimezone = function (): Date {
  return withTimezone(this, "Asia/Tehran");
};
