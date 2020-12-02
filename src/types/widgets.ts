type WidgetType = string | Widget | string[] | number[] | Widget[];

export interface Widget {
  name: string;
  required: boolean;
  multiple: boolean;
  type: WidgetType;
}
