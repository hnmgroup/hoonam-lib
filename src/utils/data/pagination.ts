import {transform, Optional, StringMap, omitEmpty} from "@/utils/core-utils";
import {toInteger} from "@/utils/num-utils";

export interface Pagination {
  limit?: number;
  offset?: number;
}

export function generatePaginationParams(pagination: Optional<Pagination>): Optional<StringMap> {
  return omitEmpty({
    limit: toInteger(pagination?.limit),
    offset: transform(toInteger(pagination?.offset), value => value > 0 ? value : undefined),
  });
}
