import yaml from "js-yaml";
import fs from "fs";
import { loadConfig } from "./input";
import type { NetlifyCMSConfig } from "./types";

const mockConfigObject = yaml.load(
  fs.readFileSync("kitchen-sink.yml", "utf-8"),
) as NetlifyCMSConfig;

describe("Load configuration", () => {
  it("should return collections from yaml config file", () => {
    const result = loadConfig("kitchen-sink.yml");

    expect(result.length).toBeDefined();
    expect(result).toEqual(mockConfigObject.collections);
  });

  it("should return collections from config object", () => {
    const result = loadConfig(mockConfigObject);

    expect(result.length).toBeDefined();
    expect(result).toEqual(mockConfigObject.collections);
  });

  it("should throw if invalid filetype", () => {
    const t = () => loadConfig("src/input.ts");
    expect(t).toThrow("Invalid filetype, must be an yaml file");
  });

  it("should throw if malformed config file", () => {
    const t = () => loadConfig(".github/workflows/build-test.yml");
    expect(t).toThrow("Failed loading collections from config");
  });

  it("should throw if malformed config object", () => {
    const t = () => loadConfig({ foo: "bar" } as NetlifyCMSConfig);
    expect(t).toThrow("Failed loading collections from config");
  });
});
