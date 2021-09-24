import yargs from "yargs";
import ora from "ora";
import { OUTPUT_FILENAME } from "./constants";
import { outputFile } from "./output";
import { loadConfig } from "./input";
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
    const { input, output = OUTPUT_FILENAME } = await args;

    spinner = ora("Loading config").start();

    const collections = loadConfig(input);

    spinner.succeed().start("Generating types");

    const types = generateTypes(collections);

    spinner.succeed().start("Saving file");

    outputFile(output, types);

    spinner.succeed();
  } catch (error: any) {
    spinner.fail(error.message);
  }
};
