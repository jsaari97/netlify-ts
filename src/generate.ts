import { pullCollection } from "./collection";
import { appendExport, formatType } from "./output";
import { resolveWidget, transformType } from "./widget";
import { flatten } from "./utils";
import { Collection } from "./types";

export const generateTypes = (collections: Collection[]): string => {
  return collections
    .map(pullCollection)
    .reduce(flatten, [])
    .map(resolveWidget)
    .reduce(transformType(), [[], []])
    .reduce(flatten, [])
    .map(formatType)
    .map(appendExport)
    .join("\n\n")
    .concat("\n");
};
