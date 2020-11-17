import { loadConfiguration } from "./input";
import { normalizeCollection } from "./normalize";
import { appendExport, formatType, outputFile } from "./output";
import { buildType, buildWidget } from "./widgets";

export default async (input: string, output: string): Promise<void> => {
  try {
    const config = await loadConfiguration(input);

    const types = config
      .flatMap(normalizeCollection)
      .map(buildWidget)
      .reduce(buildType(), [[], []])
      .flat()
      .map(formatType)
      .map(appendExport)
      .join("\n\n")
      .concat("\n");

    await outputFile(output, types);
  } catch (error) {
    return Promise.reject(error);
  }
};
