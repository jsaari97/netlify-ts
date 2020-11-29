import { Field, Widget } from "../types";

export const resolveWidget = (field: Field): Widget => {
  return {
    name: field.name,
    required: field.required !== false,
    multiple: field.widget === "list" || !!field.multiple,
    type: resolveType(field),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resolveType = (field: Field): Widget["type"] => {
  switch (field.widget) {
    case "string":
    case "text":
    case "image":
    case "date":
    case "datetime":
    case "color":
    case "markdown":
    case "map":
      return "string";
    case "number":
      return field.value_type === "int" || field.value_type === "float" ? "number" : "string";
    case "boolean":
      return "boolean";
    case "list":
      if (field.field) {
        const child = resolveWidget(field.field);

        if (typeof child.type === "string" && field.field.required === false) {
          child.type += "?";
        }

        return typeof child.type === "string" && field.field.widget !== "list" ? child.type : child;
      }

      if (field.fields) {
        return field.fields.map(resolveWidget);
      }

      if (field.types) {
        return "any";
      }

      return "string";
    case "select":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return field.options.map((option: any) =>
        typeof option === "object" ? option.value : option,
      );
    case "object":
    case undefined:
      return field.fields?.map(resolveWidget);
    case "hidden":
    case "relation":
    default:
      return "any";
  }
};
