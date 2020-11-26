import { Field, Widget } from "./types";

export const buildWidget = (field: Field): Widget => {
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
      return "string";
    case "number":
      return field.value_type === "int" || field.value_type === "float" ? "number" : "string";
    case "boolean":
      return "boolean";
    case "list":
      if (field.field) {
        const child = buildWidget(field.field);

        if (typeof child.type === "string" && field.field.required === false) {
          child.type += "?";
        }

        return typeof child.type === "string" && field.field.widget !== "list" ? child.type : child;
      }

      if (field.fields) {
        return field.fields.map(buildWidget);
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
      return field.fields?.map(buildWidget);
    case "hidden":
    case "relation":
    default:
      return "any";
  }
};

const wrapEnum = (item: number | string): string =>
  typeof item === "number" ? `${item}` : `"${item}"`;

type TypeArray = [string[], string[]];

export const buildType = (prefix = "") => (types: TypeArray, widget: Widget): TypeArray => {
  const required = !widget.required ? "?" : "";
  const multiple = widget.multiple ? "[]" : "";
  const name = prefix ? `${prefix}_${widget.name}` : widget.name;

  if (!Array.isArray(widget.type)) {
    // if widget is a primitive
    if (typeof widget.type === "string") {
      const optional = widget.type.includes("?") ? "?" : "";

      const key = `${widget.name}${required || optional}`;
      const value = `${optional ? widget.type.replace("?", "") : widget.type}${multiple}`;

      return [[...types[0], `${key}: ${value};`], types[1]];
    }

    // single field list logic

    const child = buildType(name)([[], []], {
      ...widget.type,
      multiple: widget.multiple,
      required: widget.required,
    });

    // check if nested and how deep
    const nestedDepth = (): { depth: number; optional: boolean } => {
      let depth = 0;
      let optional = false;

      const walker = (w: Widget): void => {
        depth++;

        if (!w.required) {
          optional = true;
        }

        if (typeof w.type === "object" && w.type.multiple) {
          walker(w.type);
        }
      };

      walker(widget);

      return { depth, optional };
    };

    const { depth, optional } = nestedDepth();

    return [
      [
        ...types[0],
        ...child[0].map((prop) =>
          prop
            .replace(new RegExp(`^${widget.type.name}`), `${widget.name}${optional ? "?" : ""}`)
            .replace("[]", "[]".repeat(depth)),
        ),
      ],
      [...types[1], ...child[1]],
    ];
  } else {
    const iterator = widget.type;

    // resolve to string array if list is empty
    if (!iterator.length) {
      return [[...types[0], `${widget.name}${required}: string[];`], types[1]];
    }

    // check if enum list
    if (typeof iterator[0] === "string" || typeof iterator[0] === "number") {
      return [
        [...types[0], `${widget.name}${required}: ${name}_options${multiple};`],
        [...types[1], `type ${name}_options = ${iterator.map(wrapEnum).join(" | ")};`],
      ];
    }

    // root level collection
    if (!prefix) {
      const [fields, interfaces] = iterator.reduce(buildType(widget.name), [[], []]);

      return [
        types[0],
        [...types[1], ...interfaces, `interface ${widget.name} { ${fields.join(" ")} }`],
      ];
    }

    // object field
    const [fields, interfaces] = iterator.reduce(buildType(name), [[], []]);

    return [
      [...types[0], `${widget.name}${required}: ${name}${multiple};`],
      [...types[1], ...interfaces, `interface ${name} { ${fields.join(" ")} }`],
    ];
  }

  return types;
};
