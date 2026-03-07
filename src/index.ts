import { generateTypes } from "./generate.js";
import { loadConfig } from "./input.js";
import type { NetlifyCMSConfig, NetlifyTsOptions } from "./types.js";

const createNetlifyTypes = (
  input: string | NetlifyCMSConfig,
  options: NetlifyTsOptions = {},
): string => {
  const config = loadConfig(input);

  return generateTypes(config, options);
};

export default createNetlifyTypes;
