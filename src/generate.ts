import { normalizeCollection } from "./normalize";
import { appendExport, formatType } from "./output";
import { Collection } from "./types";
import { resolveWidget, transformType } from "./widget";

export const generateTypes = (collections: Collection[]): string => {
  return collections
    .flatMap(normalizeCollection)
    .map(resolveWidget)
    .reduce(transformType(), [[], []])
    .flat()
    .map(formatType)
    .map(appendExport)
    .join("\n\n")
    .concat("\n");
};
