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

    if (typeof w.type === "object" && !Array.isArray(w.type) && w.type.multiple) {
      walker(w.type);
    }
  };

  walker(widget);

  return { depth, optional };
};

export const pullType = (type: string): string => {
  const match = type.match(/:\s(.*);$/);

  if (match) {
    return match[1];
  }

  return type;
};

export const sortTypes = (pattern: RegExp) => (a: string, b: string): number => {
  const A = pattern.test(a);
  const B = pattern.test(b);

  return A && B ? 0 : A ? 1 : B ? -1 : 0;
};

export const zip = <T>(a: T[]) => (b: T[]): [T, T][] => a.map((k, i) => [k, b[i]]);

export const insertTypeKey = (key: string) => ([value, type]: [string, string]): string =>
  type.replace("{", `{ ${key}: ${value};`);

type TypeArray = [string[], string[]];

const empty: TypeArray = [[], []];

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

    const child = transformType(name)(empty, {
      ...widget.type,
      multiple: widget.multiple,
      required: widget.required,
    });

    // check if nested and how deep
    const { depth, optional } = nestedDepth(widget);

    const propRegex = new RegExp(`^${widget.type.name}`);

    return [
      [
        ...types[0],
        ...child[0].map((prop) =>
          prop
            .replace(propRegex, `${widget.name}${optional ? "?" : ""}`)
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
        [
          ...types[1],
          `type ${name}_options = ${(iterator as (string | number)[]).map(wrapEnum).join(" | ")};`,
        ],
      ];
    }

    // typed list
    if (Array.isArray(iterator[0])) {
      const [typeKey, ...objects] = iterator[0];
      const [names, interfaces] = (objects as Widget[]).reduce(transformType(name), empty);
      const typeNames = (objects as Widget[]).map((w) => w.name);

      const pattern = new RegExp(`(${typeNames.map((w) => `${name}_${w}`).join("|")}) {`);

      // sort typed lists last and splice rest
      const rest = interfaces.sort(sortTypes(pattern)).splice(0, interfaces.length - names.length);

      const typeValues = zip(typeNames.map(wrapEnum));

      return [
        [...types[0], `${widget.name}${required}: (${names.map(pullType).join(" | ")})[];`],
        [...types[1], ...rest, ...typeValues(interfaces).map(insertTypeKey(typeKey))],
      ];
    }

    // root level collection
    if (!prefix) {
      const [fields, interfaces] = (iterator as Widget[]).reduce(transformType(widget.name), empty);

      return [
        types[0],
        [...types[1], ...interfaces, `interface ${widget.name} { ${fields.join(" ")} }`],
      ];
    }

    // object field
    const [fields, interfaces] = (iterator as Widget[]).reduce(transformType(name), [[], []]);

    return [
      [...types[0], `${widget.name}${required}: ${name}${multiple};`],
      [...types[1], ...interfaces, `interface ${name} { ${fields.join(" ")} }`],
    ];
  }
};
