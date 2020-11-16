import yargs from "yargs";
import generate from ".";

interface CommandArguments {
  input: string;
  output?: string;
}

const args = yargs
  .command<CommandArguments>("$0 <input> [output]", "Output generated types from input")
  .demandCommand(2).argv;

export const run = async (): Promise<void> => {
  const { input, output = "./netlify.types.ts" } = args;

  await generate(input, output);
};
