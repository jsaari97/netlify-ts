interface BaseField {
  name: string;
  required?: boolean;
  label?: string;
  label_singular?: string;
}

interface CommonField extends BaseField {
  widget: "string" | "text" | "markdown" | "map" | "date" | "datetime" | "color" | "hidden";
}

interface BooleanField extends BaseField {
  widget: "boolean";
}

interface CodeField extends BaseField {
  widget: "code";
  output_code_only?: boolean;
  keys?: {
    code: string;
    lang: string;
  };
}

interface ListField extends BaseField {
  widget: "list";
  fields?: Field[];
  field?: Field;
  types?: ObjectField[];
  typeKey?: string;
}

interface NumberField extends BaseField {
  widget: "number";
  value_type?: "int" | "float";
}

interface ImageField extends BaseField {
  widget: "image";
  allow_multiple?: boolean;
}

interface FileField extends BaseField {
  widget: "file";
  allow_multiple?: boolean;
}

interface SelectField extends BaseField {
  widget: "select";
  multiple?: boolean;
  options: (string | number | { label: string; value: string | number })[];
}

interface ObjectField extends BaseField {
  widget: "object";
  fields: Field[];
}

interface RelationField extends BaseField {
  widget: "relation";
  multiple?: boolean;
  collection: string;
  value_field: string;
}

interface RootField extends BaseField {
  widget: "root";
  fields: Field[];
}

export type Field =
  | CommonField
  | BooleanField
  | ListField
  | NumberField
  | ImageField
  | FileField
  | CodeField
  | SelectField
  | ObjectField
  | RelationField
  | RootField;

interface FilesField extends BaseField {
  files?: RootField[];
}

export type Collection = FilesField & RootField;
