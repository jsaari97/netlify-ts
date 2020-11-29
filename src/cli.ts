import yargs from "yargs";
import ora from "ora";
import { OUTPUT_FILENAME } from "./constants";
import { outputFile } from "./output";
import { loadConfiguration } from "./input";
import { generateTypes } from "./generate";

interface CommandArguments {
  input: string;
  output?: string;
}

const args = yargs
  .command<CommandArguments>("$0 <input> [output]", "Output generated types from input")
  .demandCommand(2).argv;

let spinner: ora.Ora;

export const run = async (): Promise<void> => {
  try {
    const { input, output = OUTPUT_FILENAME } = args;

    spinner = ora("Loading config").start();

    const collections = await loadConfiguration(input);

    spinner.succeed();
    spinner = ora("Generating types").start();

    const types = generateTypes(collections);

    spinner.succeed();
    spinner = ora("Saving file").start();

    await outputFile(output, types);

    spinner.succeed();
  } catch (error) {
    spinner.fail(error.message);
  }
};
