type WidgetType =
  | string
  | Widget
  | string[]
  | number[]
  | Widget[]
  | (string | number)[]
  | [[string, ...WidgetType[]]];

export interface Widget {
  name: string;
  required: boolean;
  multiple: boolean;
  label?: string;
  singularLabel?: string;
  type: WidgetType;
}
