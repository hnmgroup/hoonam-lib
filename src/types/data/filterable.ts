import {Optional, StringMap} from "@/utils/core-utils";
import {isEmpty, isNaN, each, isString} from "lodash-es";
import {isBlank, sanitizeString} from "@/utils/string-utils";

export interface Filterable {
  filters?: StringMap;
}

export function generateFilterParams(filterable: Optional<Filterable>): Optional<StringMap> {
  const filters: StringMap = {};

  each(filterable?.filters, (value, name) => {
    if (isBlank(value) || isNaN(value)) return;
    filters[name] = isString(value) ? sanitizeString(value) : value;
  });

  return isEmpty(filters) ? undefined : filters;
}
