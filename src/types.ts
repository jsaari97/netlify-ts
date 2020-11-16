interface Field {
  name: string;
}

export interface SubField extends Field {
  widget?: string;
  fields?: SubField[];
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface FilesField extends Field {
  files?: SubField[];
}

export interface FolderField extends Field {
  fields?: SubField[];
}

export type Collection = FilesField & FolderField;
