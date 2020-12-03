type WidgetType = string | Widget | string[] | number[] | Widget[] | (string | number)[];

export interface Widget {
  name: string;
  required: boolean;
  multiple: boolean;
  type: WidgetType;
}
