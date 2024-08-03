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
    addDays(days: number): Date;
    addHours(hours: number): Date;
    withTime(hour?: number, min?: number, sec?: number, ms?: number): Date;
    firstTimeOfDay(): Date;
    lastTimeOfDay(): Date;
    format(format?: string): string;
    equals(other: Date | undefined): boolean;
    withPersianTimezone(): Date;
  }
}
