import { loadConfiguration } from "./input";
import { normalizeCollection } from "./normalize";

export default async (input: string, output: string): Promise<void> => {
  const config = await loadConfiguration(input);
  const collections = config.flatMap(normalizeCollection);

  console.dir(collections, { depth: null });
};
