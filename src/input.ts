import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import type { Collection, NetlifyCMSConfig } from "./types";

export const loadConfig = (config: string | NetlifyCMSConfig): Collection[] => {
  let data;

  if (typeof config === "object") {
    data = config;
  }

  if (typeof config === "string") {
    data = loadConfigFile(config);
  }

  if (typeof data !== "object" || !data.collections) {
    throw new Error("Failed loading collections from config");
  }

  return data.collections;
};

const loadConfigFile = (fileName: string): NetlifyCMSConfig => {
  if (!path.extname(fileName).match(/\.ya?ml$/)) {
    throw new Error("Invalid filetype, must be an yaml file");
  }

  const file = fs.readFileSync(path.resolve(process.cwd(), fileName), "utf8");

  return yaml.load(file) as NetlifyCMSConfig;
};
