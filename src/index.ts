import { generateTypes } from "./generate";
import { loadConfig } from "./input";

export default async (input: string): Promise<string> => {
  try {
    const collections = await loadConfig(input);

    return generateTypes(collections);
  } catch (error) {
    return Promise.reject(error);
  }
};
