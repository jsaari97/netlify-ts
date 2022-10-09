import { pullCollection } from "./collection";
import { appendExport, formatType } from "./output";
import { resolveRelations, resolveWidget, transformType } from "./widget";
import type { Collection, NetlifyTsOptions } from "./types";

export const generateTypes = (
  collections: Collection[],
  options: NetlifyTsOptions = {},
): string => {
  return collections
    .flatMap(pullCollection)
    .map(resolveWidget)
    .reduce(
      transformType({
        label: !!options.label,
        capitalize: !!options.capitalize,
        delimiter: options.delimiter,
      }),
      [[], []],
    )
    .flat()
    .map(resolveRelations)
    .map(formatType)
    .map(appendExport)
    .join("\n\n")
    .replace(/^/, "/* eslint-disable */\n/* tslint:disable */\n\n")
    .concat("\n");
};
