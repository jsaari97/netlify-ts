import { Field, Widget } from "./types";

export const buildWidget = (field: Field): Widget => {
  return {
    name: field.name,
    required: field.required !== false,
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
      return [(field.fields || []).map(buildWidget)];
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

type TypeArray = [string[], string[]];

export const buildType = (prefix = "") => (types: TypeArray, widget: Widget): TypeArray => {
  const required = widget.required ? "" : "?";

  if (!Array.isArray(widget.type)) {
    types[0].push(`${widget.name}${required}: ${widget.type};`);
  } else {
    const isArray = Array.isArray(widget.type[0]);
    const iterator = isArray ? widget.type[0] : widget.type;

    if (!iterator.length) {
      types[0].push(`${widget.name}${required}: string[];`);

      return types;
    }

    if (typeof iterator[0] === "string") {
      const name = prefix ? `${prefix}_${widget.name}` : widget.name;

      types[1].push(`type ${name}_options = '${iterator.join("' | '")}';`);
      types[0].push(`${widget.name}${required}: ${name}_options;`);

      return types;
    }

    if (!prefix) {
      const [fields, interfaces] = iterator.reduce(buildType(widget.name), [[], []]);

      types[1].push(...interfaces, `interface ${widget.name} { ${fields.join(" ")} }`);

      return types;
    }

    const name = `${prefix}_${widget.name}`;

    const [fields, interfaces] = iterator.reduce(buildType(name), [[], []]);

    types[1].push(...interfaces, `interface ${name} { ${fields.join(" ")} }`);
    types[0].push(`${widget.name}${required}: ${name}${isArray ? "[]" : ""};`);
  }

  return types;
};
