import { generateTypes } from "./generate";
import { loadConfig } from "./input";
import type { NetlifyTsOptions } from "./types";

export const createNetlifyTypes = (input: string, options: NetlifyTsOptions = {}): string => {
  const collections = loadConfig(input);

  return generateTypes(collections, options);
};

export const createNetlifyTypesAsync = async (
  input: string,
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
