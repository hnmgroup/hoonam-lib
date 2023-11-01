import {isAbsent} from "@/utils/core-utils";
import { v4 as uuid } from "uuid";

export class ClientIdentityService {

  private _id: string;

  get id() { return this._id; }

  initialize(): this {
    if (isAbsent(this._id)) {
      let id = localStorage.getItem("clientId");
      if (isAbsent(id)) {
        id = uuid().replace(/-/g, "");
        localStorage.setItem("clientId", id);
      }
      this._id = id;
    }
    return this;
  }
}
