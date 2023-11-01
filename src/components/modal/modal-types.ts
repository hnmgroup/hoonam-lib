import {Observable} from "rxjs";
import {OperationState} from "@/utils/core-utils";

export interface ModalInstance {
  loading: OperationState;
  show(): void;
  close(result?: string): void;
  readonly shown: Observable<void>;
  readonly hidden: Observable<void>;
  readonly visibility: boolean;
}
