import {transform, Optional, StringMap, omitEmpty} from "@/utils/core-utils";
import {sanitizeInteger} from "@/utils/num-utils";

export interface Pagination {
  limit?: number;
  offset?: number;
}

export function generatePaginationParams(pagination: Optional<Pagination>): Optional<StringMap> {
  const params = {
    limit: sanitizeInteger(pagination?.limit),
    offset: transform(sanitizeInteger(pagination?.offset), o => o > 0 ? o : undefined),
  };
  return omitEmpty(params);
}
