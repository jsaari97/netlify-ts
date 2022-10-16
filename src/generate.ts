import { pullCollection } from "./collection";
import { appendExport, formatType } from "./output";
import { resolveRelations, resolveWidget, transformType } from "./widget";
import type { NetlifyCMSConfig, NetlifyTsOptions } from "./types";

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
    .replace(/^/, "/* eslint-disable */\n/* tslint:disable */\n\n")
    .concat("\n");
};

export const hasExternalMediaLibrary = (config: NetlifyCMSConfig): boolean =>
  !!config.media_library?.name && !!config.media_library?.config;
