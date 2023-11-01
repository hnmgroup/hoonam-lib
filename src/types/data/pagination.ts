import {isEmpty, omitBy} from "lodash-es";
import {transform, isAbsent, Optional, StringMap} from "@/utils/core-utils";
import {sanitizeInteger} from "@/utils/num-utils";

export interface Pagination {
  limit?: number;
  offset?: number;
}

export function generatePaginationParams(pagination: Optional<Pagination>): Optional<StringMap> {
  const params = omitBy(<Pagination>{
    limit: sanitizeInteger(pagination?.limit),
    offset: transform(sanitizeInteger(pagination?.offset), o => o > 0 ? o : undefined),
  }, isAbsent);
  return isEmpty(params) ? undefined : params;
}
