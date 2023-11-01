import {clone} from 'lodash-es';
import moment from "jalali-moment";
import {isAbsent} from "@/utils/core-utils";

export function now(): Date {
  return new Date();
}

export function today(): Date {
  return startTimeOfDay(now());
}

export function addYears(date: Date, value: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + value);
  return newDate;
}

export function lastTimeOfDay(date: Date): Date {
  return withTime(date, 23, 59, 59, 999);
}

export function startTimeOfDay(date: Date): Date {
  return withTime(date, 0, 0, 0, 0);
}

export function toDateTimeString(date: Date, format?: string): string {
  format ??= "yyyy-MM-dd HH:mm:ss.fff";

  const y = date.getFullYear().toString();
  const mon = (date.getMonth() + 1).toString();
  const d = date.getDate().toString();
  const H = date.getHours().toString();
  const h = getHour12(date.getHours()).toString();
  const min = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  const ms = date.getMilliseconds().toString().padStart(3, "0");

  let formatBuffer = format;

  formatBuffer = formatBuffer.replace(/yyyy/igm, y.padStart(4, "0"));
  formatBuffer = formatBuffer.replace(/yyy/igm, y.padStart(4, "0").substring(1));
  formatBuffer = formatBuffer.replace(/yy/igm, y.padStart(4, "0").substring(2));
  formatBuffer = formatBuffer.replace(/y/igm, y);

  formatBuffer = formatBuffer.replace(/MM/gm, mon.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/M/gm, mon);

  formatBuffer = formatBuffer.replace(/dd/igm, d.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/d/igm, d);

  formatBuffer = formatBuffer.replace(/HH/gm, H.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/H/gm, H);
  formatBuffer = formatBuffer.replace(/hh/gm, h.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/h/gm, h);

  formatBuffer = formatBuffer.replace(/mm/gm, min.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/m/gm, min);

  formatBuffer = formatBuffer.replace(/ss/igm, s.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/s/igm, s);

  formatBuffer = formatBuffer.replace(/fff/igm, ms.padStart(3, "0"));
  formatBuffer = formatBuffer.replace(/f/igm, ms);

  return formatBuffer.toString();
}

function getHour12(hour: number): number {
  if (hour == 0) return 12;
  if (hour <= 12) return hour;
  return hour - 12;
}

export function toPersianFormat(date: Date, format?: string): string {
  format ??= "yyyy/MM/dd HH:mm:ss.fff";

  const persian = moment(new Date(date)).locale('fa');
  const y = persian.year().toString();
  const mon = (persian.month() + 1).toString();
  const monthShortName = persian.format('MMM');
  const monthName = persian.format('MMMM');
  const d = persian.date().toString();
  const weekdayShortName = persian.format('ddd');
  const weekdayName = persian.format('dddd');
  const H = persian.hours().toString();
  const h = getHour12(persian.hours()).toString();
  const min = persian.minutes().toString();
  const s = persian.seconds().toString();
  const ms = persian.milliseconds().toString();

  let formatBuffer = format;

  formatBuffer = formatBuffer.replace(/yyyy/igm, y.padStart(4, "0"));
  formatBuffer = formatBuffer.replace(/yyy/igm, y.padStart(4, "0").substring(1));
  formatBuffer = formatBuffer.replace(/yy/igm, y.padStart(4, "0").substring(2));
  formatBuffer = formatBuffer.replace(/y/igm, y);

  formatBuffer = formatBuffer.replace(/MMMM/gm, monthName);
  formatBuffer = formatBuffer.replace(/MMM/gm, monthShortName);
  formatBuffer = formatBuffer.replace(/MM/gm, mon.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/M/gm, mon);

  formatBuffer = formatBuffer.replace(/dddd/igm, weekdayName);
  formatBuffer = formatBuffer.replace(/ddd/igm, weekdayShortName);
  formatBuffer = formatBuffer.replace(/dd/igm, d.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/d/igm, d);

  formatBuffer = formatBuffer.replace(/HH/gm, H.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/H/gm, H);
  formatBuffer = formatBuffer.replace(/hh/gm, h.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/h/gm, h);

  formatBuffer = formatBuffer.replace(/mm/gm, min.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/m/gm, min);

  formatBuffer = formatBuffer.replace(/ss/igm, s.padStart(2, "0"));
  formatBuffer = formatBuffer.replace(/s/igm, s);

  formatBuffer = formatBuffer.replace(/fff/igm, ms.padStart(3, "0"));
  formatBuffer = formatBuffer.replace(/f/igm, ms);

  return formatBuffer.toString();
}

export function toUTCFormat(date: Date): string {
  return date?.toISOString();
}

export function fromPersianDate(persianDate: string): Date {
  const m = moment(persianDate, "jYYYY/jMM/jDD");
  return m.toDate();
}

export function isToday(date: Date): boolean {
  return moment(date).isSame(moment(), 'day');
}

export function isTomorrow(date: Date): boolean {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
}

export function withTime(date: Date, hours?: number, min?: number, sec?: number, ms?: number): Date {
  if (isAbsent(date)) return undefined;

  date = clone(new Date(date));
  date.setHours(
    hours ?? date.getHours(),
    min ?? date.getMinutes(),
    sec ?? date.getSeconds(),
    ms ?? date.getMilliseconds()
  );
  return date;
}

export function getTimezoneOffset(): string {
  let value = (new Date()).getTimezoneOffset() * -1;
  if (value === 0) return "Z";
  const s = value > 0 ? '+' : '-';
  value = Math.abs(value);
  const h = Math.trunc(value / 60);
  const m = (value % 60);
  return s + h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
}

export function getTimezone(): string {
  return (new Intl.DateTimeFormat()).resolvedOptions().timeZone ?? "UTC";
}
