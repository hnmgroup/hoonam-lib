import {omitEmpty, Optional} from "@lib/utils/core-utils";

export interface Exportable {
  exportOptions?: ExportOptions;
}

export interface ExportOptions {
  format: string;
  fileName?: string;
  title?: string;
  description?: string;
  columns?: {
    name: string;
    title?: string;
    format?: string;
    locale?: string;
    values?: {value: any; title: string;}[];
  }[];
}

export function generateExportParams(exportable: Optional<Exportable>): Optional<any> {
  return omitEmpty(exportable.exportOptions);
}
