import type { Field, Widget } from "../types";

interface ResolveOptions {
  externalMediaLibrary?: boolean;
}

export const resolveWidget =
  (options: ResolveOptions = {}) =>
  (field: Field): Widget => {
    return {
      name: field.name,
      required: field.required !== false,
      label: field.label,
      singularLabel: field.label_singular,
      multiple:
        field.widget === "list" ||
        ((field.widget === "select" || field.widget === "relation") && !!field.multiple) ||
        (!!options.externalMediaLibrary &&
          (field.widget === "file" || field.widget === "image") &&
          !!field.media_library?.config?.multiple),
      type: resolveType(field, options),
    };
  };

export const resolveType = (field: Field, options: ResolveOptions = {}): Widget["type"] => {
  switch (field.widget) {
    case "string":
    case "text":
    case "image":
    case "date":
    case "datetime":
    case "color":
    case "markdown":
    case "map":
    case "file":
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
        const child = resolveWidget(options)(field.field);

        if (typeof child.type === "string" && field.field.required === false) {
          child.type += "?";
        }

        return typeof child.type === "string" && field.field.widget !== "list" ? child.type : child;
      }

      if (field.fields) {
        return field.fields.map(resolveWidget(options));
      }

      if (field.types) {
        const type = field.typeKey || "type";
        return [[type, ...field.types.map(resolveWidget(options))]];
      }

      return "string";
    case "select":
      return field.options.map((option) => (typeof option === "object" ? option.value : option));
    case "object":
    case "root":
      return field.fields?.map(resolveWidget(options));
    case "relation":
      return `~${field.collection}/${field.value_field}`;
    case "hidden":
    default:
      return "any";
  }
};
