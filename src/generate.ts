import { pullCollection } from "./collection";
import { appendExport, formatType } from "./output";
import { resolveWidget, transformType } from "./widget";
import { Collection } from "./types";

export const generateTypes = (collections: Collection[]): string => {
  return collections
    .flatMap(pullCollection)
    .map(resolveWidget)
    .reduce(transformType(), [[], []])
    .flat()
    .map(formatType)
    .map(appendExport)
    .join("\n\n")
    .replace(/^/, '/* eslint-disable */\n/* tslint:disable */\n\n')
    .concat("\n");
};
