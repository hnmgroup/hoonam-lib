import {generateUniqueId, isAbsent} from "@/utils/core-utils";

export class ClientIdentityService {

  private _id: string;

  get id() { return this._id; }

  initialize(): void {
    if (isAbsent(this._id)) {
      let id = localStorage.getItem("clientId");
      if (isAbsent(id)) {
        id = generateUniqueId();
        localStorage.setItem("clientId", id);
      }
      this._id = id;
    }
  }
}
