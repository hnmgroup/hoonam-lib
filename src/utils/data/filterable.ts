import {omitEmpty, Optional, StringMap} from "@/utils/core-utils";

export interface Filterable {
  filters?: StringMap;
}

export function generateFilterParams(filterable: Optional<Filterable>): Optional<StringMap> {
  return omitEmpty(filterable?.filters);
}
