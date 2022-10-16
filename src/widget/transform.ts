import { DEFAULT_DELIMITER } from "../constants";
import type { Widget } from "../types";

export const getName = (name: string, capitalize: boolean, delimiter: string) =>
  toDelimiter(capitalize ? toCapitalized(name) : name, delimiter);

export const getWidgetName = (
  widget: Widget,
  useLabel: boolean,
  capitalize: boolean,
  delimiter: string,
): string =>
  getName(
    useLabel ? toCamelCase(widget.singularLabel || widget.label || widget.name) : widget.name,
    capitalize,
    delimiter,
  );

export const toCamelCase = (str: string): string =>
  str.replace(/([^a-z\d]+)([a-z\d])/gi, (match, delimiter, char) => char.toUpperCase());

export const toCapitalized = (str: string) =>
  str.replace(
    /(^|[^a-z\d])([a-z\d])/gi,
    (match, delimiter, char) => `${delimiter}${char.toUpperCase()}`,
  );

export const toDelimiter = (str: string, delimiter: string) =>
  str.replace(/[^a-z\d]+/gi, delimiter);

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

export const sortTypes =
  (pattern: RegExp) =>
  (a: string, b: string): number => {
    const A = pattern.test(a);
    const B = pattern.test(b);

    return A && B ? 0 : A ? 1 : B ? -1 : 0;
  };

export const zip =
  <T>(a: T[]) =>
  (b: T[]): [T, T][] =>
    a.map((k, i) => [k, b[i]]);

export const insertTypeKey =
  (key: string) =>
  ([value, type]: [string, string]): string =>
    type.replace("{", `{ ${key}: ${value};`);

type TypeArray = [string[], string[]];

const empty: TypeArray = [[], []];

export interface TransformState {
  prefix?: string;
  label?: boolean;
  capitalize?: boolean;
  delimiter?: string;
}

export const transformType =
  ({
    prefix = "",
    label = false,
    capitalize = false,
    delimiter = DEFAULT_DELIMITER,
  }: TransformState = {}) =>
  (types: TypeArray, widget: Widget): TypeArray => {
    const required = !widget.required ? "?" : "";
    const multiple = widget.multiple ? "[]" : "";

    const widgetName = getWidgetName(widget, label, capitalize, delimiter);

    const name = getName(prefix ? `${prefix}_${widgetName}` : widgetName, capitalize, delimiter);

    if (!Array.isArray(widget.type)) {
      // if widget name is `body`
      if (widget.name === "body") {
        return types;
      }

      // if widget is a primitive
      if (typeof widget.type === "string") {
        const optional = widget.type.includes("?") ? "?" : "";

        const key = `${widget.name}${required || optional}`;
        const value = `${optional ? widget.type.replace("?", "") : widget.type}${multiple}`;

        return [[...types[0], `${key}: ${value};`], types[1]];
      }

      // single field list logic

      const child = transformType({ prefix: name, label, capitalize })(empty, {
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
              .replace(propRegex, `${widgetName}${optional ? "?" : ""}`)
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
        const enumName = getName(`${name}_options`, capitalize, delimiter);
        return [
          [...types[0], `${widget.name}${required}: ${enumName}${multiple};`],
          [
            ...types[1],
            `type ${enumName} = ${(iterator as (string | number)[]).map(wrapEnum).join(" | ")};`,
          ],
        ];
      }

      // typed list
      if (Array.isArray(iterator[0])) {
        const [typeKey, ...objects] = iterator[0];
        const [names, interfaces] = (objects as Widget[]).reduce(
          transformType({ prefix: name, label, capitalize, delimiter }),
          empty,
        );

        const pattern = new RegExp(
          `(${(objects as Widget[])
            .map((w) =>
              getName(
                `${name}_${getWidgetName(w, label, capitalize, delimiter)}`,
                capitalize,
                delimiter,
              ),
            )
            .join("|")}) {`,
        );

        // sort typed lists last and splice rest
        const rest = interfaces
          .sort(sortTypes(pattern))
          .splice(0, interfaces.length - names.length);

        const typeNames = (objects as Widget[]).map((w) => w.name);
        const typeValues = zip(typeNames.map(wrapEnum));

        return [
          [...types[0], `${widget.name}${required}: (${names.map(pullType).join(" | ")})[];`],
          [...types[1], ...rest, ...typeValues(interfaces).map(insertTypeKey(typeKey))],
        ];
      }

      // root level collection
      if (!prefix) {
        const [fields, interfaces] = (iterator as Widget[]).reduce(
          transformType({ prefix: widgetName, label, capitalize, delimiter }),
          empty,
        );

        return [
          types[0],
          [...types[1], ...interfaces, `interface ${widgetName} { ${fields.join(" ")} }`],
        ];
      }

      // object field
      const [fields, interfaces] = (iterator as Widget[]).reduce(
        transformType({ prefix: name, label, capitalize, delimiter }),
        [[], []],
      );

      return [
        [...types[0], `${widget.name}${required}: ${name}${multiple};`],
        [...types[1], ...interfaces, `interface ${name} { ${fields.join(" ")} }`],
      ];
    }
  };
