import { generateTypes } from "./generate";
import { loadConfig } from "./input";
import type { NetlifyCMSConfig, NetlifyTsOptions } from "./types";

const createNetlifyTypes = (
  input: string | NetlifyCMSConfig,
  options: NetlifyTsOptions = {},
): string => {
  const config = loadConfig(input);

  return generateTypes(config, options);
};

export default createNetlifyTypes;
