export interface Widget {
  name: string;
  required: boolean;
  multiple: boolean;
  type: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
