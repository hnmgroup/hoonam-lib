import {transform, Optional, StringMap, omitEmpty} from "@/utils/core-utils";
import {sanitizeInteger} from "@/utils/num-utils";

export interface Pagination {
  limit?: number;
  offset?: number;
}

export function generatePaginationParams(pagination: Optional<Pagination>): Optional<StringMap> {
  return omitEmpty({
    limit: sanitizeInteger(pagination?.limit),
    offset: transform(sanitizeInteger(pagination?.offset), value => value > 0 ? value : undefined),
  });
}
