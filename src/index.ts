import { generateTypes } from "./generate";
import { loadConfiguration } from "./input";

export default async (input: string): Promise<string> => {
  try {
    const collections = await loadConfiguration(input);

    return generateTypes(collections);
  } catch (error) {
    return Promise.reject(error);
  }
};
