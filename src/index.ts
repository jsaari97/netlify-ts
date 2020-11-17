import { loadConfiguration } from "./input";
import { normalizeCollection } from "./normalize";
import { buildType, buildWidget } from "./widgets";

export default async (input: string, output: string): Promise<void> => {
  const config = await loadConfiguration(input);
  const collections = config.flatMap(normalizeCollection);

  const widgets = collections.map(buildWidget);

  const types = widgets.reduce(buildType(), [[], []]);

  console.dir(types, { depth: null });
};
