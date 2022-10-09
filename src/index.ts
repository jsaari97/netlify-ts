import { generateTypes } from "./generate";
import { loadConfig } from "./input";
import type { NetlifyCMSConfig, NetlifyTsOptions } from "./types";

export const createNetlifyTypes = (
  input: string | NetlifyCMSConfig,
  options: NetlifyTsOptions = {},
): string => {
  const collections = loadConfig(input);

  return generateTypes(collections, options);
};

export const createNetlifyTypesAsync = async (
  input: string | NetlifyCMSConfig,
  options?: NetlifyTsOptions,
): Promise<string> => {
  try {
    const types = createNetlifyTypes(input, options);

    return Promise.resolve(types);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default createNetlifyTypesAsync;
