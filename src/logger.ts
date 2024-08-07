export abstract class Logger {
  abstract info(message: string): void;
  abstract warn(message: string): void;
  abstract error(message: string, error?: Error): void;
}

export class ConsoleLogger implements Logger {
  error(message: string, error?: Error): void {
    console.error(message, error);
  }

  info(message: string): void {
    console.info(message);
  }

  warn(message: string): void {
    console.warn(message);
  }
}
