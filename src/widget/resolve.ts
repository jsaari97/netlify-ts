import type { Field, Widget } from "../types";

export const resolveWidget = (field: Field): Widget => {
  return {
    name: field.name,
    required: field.required !== false,
    multiple:
      field.widget === "list" ||
      ((field.widget === "select" || field.widget === "relation") && !!field.multiple),
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
    case "code":
      if (field.output_code_only) {
        return "string";
      }

      const { code = "code", lang = "lang" } = field.keys || {};

      return [
        { name: code, required: true, multiple: false, type: "string" },
        { name: lang, required: true, multiple: false, type: "string" },
      ];
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
        const type = field.typeKey || "type";
        return [[type, ...field.types.map(resolveWidget)]];
      }

      return "string";
    case "select":
      return field.options.map((option) => (typeof option === "object" ? option.value : option));
    case "object":
    case "root":
      return field.fields?.map(resolveWidget);
    case "relation":
      return `~${field.collection}/${field.value_field}`;
    case "hidden":
    default:
      return "any";
  }
};
