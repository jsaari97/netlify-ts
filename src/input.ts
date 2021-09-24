import yaml from "js-yaml";
import { promises as fs } from "fs";
import path from "path";
import type { Collection } from "./types";

interface YamlInput {
  collections?: Collection[];
}

export const loadConfig = async (filePath: string): Promise<Collection[]> => {
  try {
    if (!path.extname(filePath).match(/\.ya?ml$/)) {
      return Promise.reject("Invalid filetype, must be an yaml file");
    }

    const file = await fs.readFile(path.resolve(process.cwd(), filePath), "utf8");

    const data = yaml.load(file) as YamlInput;

    if (typeof data !== "object" || !data.collections) {
      return Promise.reject("Failed loading collections from config file");
    }

    return data.collections;
  } catch (error) {
    return Promise.reject(error);
  }
};
