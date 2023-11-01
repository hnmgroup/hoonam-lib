import {ErrorBase} from "@/utils/core-utils";

export abstract class LoggerService {
  abstract info(message: string): void;
  abstract warn(message: string): void;
  abstract error(message: string, error?: ErrorBase): void;
}
