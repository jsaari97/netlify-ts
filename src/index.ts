import { generateTypes } from "./generate";
import { loadConfig } from "./input";

export const createNetlifyTypes = (input: string): string => {
  const collections = loadConfig(input);

  return generateTypes(collections);
};

export const createNetlifyTypesAsync = async (input: string): Promise<string> => {
  try {
    const types = createNetlifyTypes(input);

    return Promise.resolve(types);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default createNetlifyTypesAsync;
