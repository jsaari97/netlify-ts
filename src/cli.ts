import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import ora from "ora";
import { DEFAULT_DELIMITER, OUTPUT_FILENAME } from "./constants.js";
import { outputFile } from "./output.js";
import { loadConfig } from "./input.js";
import { generateTypes } from "./generate.js";
import type { NetlifyTsOptions } from "./types.js";
import type { Ora } from "ora";

interface CommandArguments extends NetlifyTsOptions {
  input: string;
  output?: string;
}

const args = yargs(hideBin(process.argv))
  .command<CommandArguments>("* <input> [output]", "Output generated types from input")
  .option("label", {
    demandOption: false,
    default: true,
    describe: `use 'label_singular' or 'label' as interface name`,
    type: "boolean",
  })
  .option("capitalize", {
    demandOption: false,
    default: false,
    describe: "capitalize type names",
    type: "boolean",
  })
  .option("delimiter", {
    demandOption: false,
    default: DEFAULT_DELIMITER,
    describe: "type name delimiter. e.g. 'Posts_Author'",
    type: "string",
}).argv;

export const run = async (): Promise<void> => {
  let spinner: Ora | undefined;

  try {
    const parsed = (await args) as {
      input?: unknown;
      output?: unknown;
      label?: unknown;
      capitalize?: unknown;
      delimiter?: unknown;
      _: unknown[];
    };
    const positionalOutput = parsed._[1];
    const input = typeof parsed.input === "string" ? parsed.input : "";
    const output =
      typeof parsed.output === "string"
        ? parsed.output
        : typeof positionalOutput === "string"
          ? positionalOutput
          : OUTPUT_FILENAME;
    const label = typeof parsed.label === "boolean" ? parsed.label : true;
    const capitalize = typeof parsed.capitalize === "boolean" ? parsed.capitalize : false;
    const delimiter = typeof parsed.delimiter === "string" ? parsed.delimiter : DEFAULT_DELIMITER;

    spinner = ora("Loading config").start();

    const collections = loadConfig(input);

    spinner.succeed().start("Generating types");

    const types = generateTypes(collections, { label, capitalize, delimiter });

    spinner.succeed().start("Saving file");

    outputFile(output, types);

    spinner.succeed();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (spinner) {
      spinner.fail(message);
      return;
    }

    console.error(message);
  }
};
