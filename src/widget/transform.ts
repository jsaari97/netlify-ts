import { Widget } from "../types";

export const wrapEnum = (item: number | string): string =>
  typeof item === "number" ? `${item}` : `"${item}"`;

export const nestedDepth = (widget: Widget): { depth: number; optional: boolean } => {
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

type TypeArray = [string[], string[]];

export const transformType = (prefix = "") => (types: TypeArray, widget: Widget): TypeArray => {
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

    const child = transformType(name)([[], []], {
      ...widget.type,
      multiple: widget.multiple,
      required: widget.required,
    });

    // check if nested and how deep
    const { depth, optional } = nestedDepth(widget);

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
      const [fields, interfaces] = iterator.reduce(transformType(widget.name), [[], []]);

      return [
        types[0],
        [...types[1], ...interfaces, `interface ${widget.name} { ${fields.join(" ")} }`],
      ];
    }

    // object field
    const [fields, interfaces] = iterator.reduce(transformType(name), [[], []]);

    return [
      [...types[0], `${widget.name}${required}: ${name}${multiple};`],
      [...types[1], ...interfaces, `interface ${name} { ${fields.join(" ")} }`],
    ];
  }
};
