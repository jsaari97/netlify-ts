import { Field, Widget } from "./types";

export const buildWidget = (field: Field): Widget => {
  switch (field.widget) {
    case "string":
    case "text":
    case "image":
    case "date":
    case "datetime":
    case "color":
    case "markdown":
      return {
        name: field.name,
        type: "string",
      };
    case "number":
      return {
        name: field.name,
        type: field.value_type === "int" || field.value_type === "float" ? "number" : "string",
      };
    case "boolean":
      return {
        name: field.name,
        type: "boolean",
      };
    case "list":
      return {
        name: field.name,
        type: [(field.fields || []).map(buildWidget)],
      };
    case "hidden":
    case "relation":
      return {
        name: field.name,
        type: "any",
      };
    case "select":
      return {
        name: field.name,
        type: field.options,
      };
    case undefined: {
      return {
        name: field.name,
        type: field.fields?.map(buildWidget),
      };
    }
    default:
      return {
        name: field.name,
        type: field.fields?.map(buildWidget),
      };
  }
};

type TypeArray = [string[], string[]];

export const buildType = (prefix = "") => (types: TypeArray, widget: Widget): TypeArray => {
  if (!Array.isArray(widget.type)) {
    types[0].push(`${widget.name}: ${widget.type};`);
  } else {
    const isArray = Array.isArray(widget.type[0]);
    const iterator = isArray ? widget.type[0] : widget.type;

    if (!iterator.length) {
      types[0].push(`${widget.name}: string[];`);

      return types;
    }

    if (typeof iterator[0] === "string") {
      const name = prefix ? `${prefix}_${widget.name}`: widget.name

      types[1].push(`type ${name}_options = '${iterator.join("' | '")}';`);
      types[0].push(`${widget.name}: ${name}_options;`);

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
    types[0].push(`${widget.name}: ${name}${isArray ? "[]" : ""};`);
  }

  return types;
};
