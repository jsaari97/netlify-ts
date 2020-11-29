import yargs from "yargs";
import generate from ".";
import { OUTPUT_FILENAME } from "./constants";
import { outputFile } from "./output";

interface CommandArguments {
  input: string;
  output?: string;
}

const args = yargs
  .command<CommandArguments>("$0 <input> [output]", "Output generated types from input")
  .demandCommand(2).argv;

export const run = async (): Promise<void> => {
  const { input, output = OUTPUT_FILENAME } = args;

  const types = await generate(input);

  await outputFile(output, types);
};
