import { pullCollection } from "./collection";
import { appendExport, formatType } from "./output";
import { resolveRelations, resolveWidget, transformType } from "./widget";
import type { Collection } from "./types";

export const generateTypes = (collections: Collection[]): string => {
  return collections
    .flatMap(pullCollection)
    .map(resolveWidget)
    .reduce(transformType(), [[], []])
    .flat()
    .map(resolveRelations)
    .map(formatType)
    .map(appendExport)
    .join("\n\n")
    .replace(/^/, "/* eslint-disable */\n/* tslint:disable */\n\n")
    .concat("\n");
};
