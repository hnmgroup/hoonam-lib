export interface DataQueryResult<TItem, TSummaries = unknown> {
  readonly items: TItem[];
  readonly total: number;
  readonly offset: number;
  readonly summaries: TSummaries;
}
