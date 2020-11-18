interface BaseField {
  name: string;
}

export interface Field extends BaseField {
  widget?: string;
  required?: boolean;
  fields?: Field[];
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface FilesField extends BaseField {
  files?: Field[];
}

export interface FolderField extends BaseField {
  fields?: Field[];
}

export type Collection = FilesField & FolderField;

export interface Widget {
  name: string;
  required: boolean;
  type: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
