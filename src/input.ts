import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import type { Collection } from "./types";

export interface NetlifyCMSConfig {
  collections?: Collection[];
}

export const loadConfig = (config: string | NetlifyCMSConfig): Collection[] => {
  let data;

  if (typeof config === "object") {
    data = config;
  }

  if (typeof config === "string") {
    if (!path.extname(config).match(/\.ya?ml$/)) {
      throw new Error("Invalid filetype, must be an yaml file");
    }

    const file = fs.readFileSync(path.resolve(process.cwd(), config), "utf8");

    data = yaml.load(file) as NetlifyCMSConfig;
  }

  if (typeof data !== "object" || !data.collections) {
    throw new Error("Failed loading collections from config");
  }

  return data.collections;
};
