import { generateTypes } from "./generate";
import { loadConfig } from "./input";
import type { NetlifyCMSConfig, NetlifyTsOptions } from "./types";

const createNetlifyTypes = (
  input: string | NetlifyCMSConfig,
  options: NetlifyTsOptions = {},
): string => {
  const collections = loadConfig(input);

  return generateTypes(collections, options);
};

export default createNetlifyTypes;
