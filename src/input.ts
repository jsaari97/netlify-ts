import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import type { Collection } from "./types";

interface YamlInput {
  collections?: Collection[];
}

export const loadConfig = (filePath: string): Collection[] => {
  if (!path.extname(filePath).match(/\.ya?ml$/)) {
    throw new Error("Invalid filetype, must be an yaml file");
  }

  const file = fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");

  const data = yaml.load(file) as YamlInput;

  if (typeof data !== "object" || !data.collections) {
    throw new Error("Failed loading collections from config file");
  }

  return data.collections;
};
