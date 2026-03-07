import { pullCollection } from "./collection.js";
import { appendExport, formatType } from "./output.js";
import { resolveRelations, resolveWidget, transformType } from "./widget.js";
import type { NetlifyCMSConfig, NetlifyTsOptions } from "./types.js";

export const generateTypes = (config: NetlifyCMSConfig, options: NetlifyTsOptions = {}): string => {
  const externalMediaLibrary = hasExternalMediaLibrary(config);

  return config.collections
    .flatMap(pullCollection)
    .map(resolveWidget({ externalMediaLibrary }))
    .reduce(
      transformType({
        label: !!options.label,
        capitalize: !!options.capitalize,
        delimiter: options.delimiter,
      }),
      [[], []],
    )
    .flat()
    .map(resolveRelations({ delimiter: options.delimiter }))
    .map(formatType)
    .map(appendExport)
    .join("\n\n")
    .replace(/^/, "/* eslint-disable */\n")
    .concat("\n");
};

export const hasExternalMediaLibrary = (config: NetlifyCMSConfig): boolean =>
  !!config.media_library?.name && !!config.media_library?.config;
