import {WeekDay} from "./date-utils?__target=./index";

/* extensions */
export {}
declare global {
  interface Date {
    sanitize(): Date | undefined;
    dateOnly(): Date;
    toTime(): Date | undefined;
    timeOnly(): Date;
    weekday(): WeekDay;
    compareTo(other: Date|undefined): number;
    hour12(): number;
    addYears(years: number): Date;
    addMonths(months: number): Date;
    addDays(days: number): Date;
    addHours(hours: number): Date;
    addMinutes(minutes: number): Date;
    addSeconds(seconds: number): Date;
    addMilliseconds(milliseconds: number): Date;
    subtractYears(years: number): Date;
    subtractMonths(months: number): Date;
    subtractDays(days: number): Date;
    subtractHours(hours: number): Date;
    subtractMinutes(minutes: number): Date;
    subtractSeconds(seconds: number): Date;
    subtractMilliseconds(milliseconds: number): Date;
    withTime(hour?: number, min?: number, sec?: number, ms?: number): Date;
    isToday(): boolean;
    firstTimeOfDay(): Date;
    lastTimeOfDay(): Date;
    format(format?: string, locale?: string): string;
    equals(other: Date | undefined): boolean;
    toTimezone(timezone: string): Date;
    toPersianTimezone(): Date;
  }

  interface String {
    toDate(): Date;
  }
}
