import yaml from "js-yaml";
import { promises as fs } from "fs";
import path from "path";
import { Collection } from "./types";

interface YamlInput {
  collections?: Collection[];
}

export const loadConfiguration = async (filePath: string): Promise<Collection[]> => {
  try {
    const file = await fs.readFile(path.join(process.cwd(), filePath), "utf8");
    const data = yaml.safeLoad(file) as YamlInput;

    if (typeof data !== "object" || !data.collections) {
      return Promise.reject("Failed loading collections from config file");
    }

    return data.collections;
  } catch (error) {
    return Promise.reject(error);
  }
};
