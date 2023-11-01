import {isArray, isEmpty, isString, map} from "lodash-es";
import {Optional, StringMap} from "@/utils/core-utils";

export interface Sortable {
  sort?: SortsObject | SortItemOrFieldName[] | SortItemOrFieldName;
}

type SortsObject = StringMap<Optional<SortDirection>>;
type SortItem = {name: string; dir?: SortDirection;};
type SortItemOrFieldName = string | SortItem;
type SortDirection = "asc" | "desc";

export function generateSortParams(sortable: Optional<Sortable>): Optional<StringMap> {
  if (isEmpty(sortable?.sort)) return undefined;

  let items: SortItem[];
  if (isArray(sortable.sort)) items = sortable.sort.map<SortItem>(item => isString(item) ? {name: item} : item);
  else if (isString(sortable.sort)) items = [{name: sortable.sort}];
  else items = map<any, SortItem>(sortable.sort, (dir, name) => ({name, dir}));

  const sort = items.length > 0 ? items.map(sort => (sort.dir != "desc" ? '+' : '') + sort.name).join(',') : undefined;

  return isEmpty(sort) ? undefined : { sort };
}
