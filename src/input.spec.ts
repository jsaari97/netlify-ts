import { loadConfig } from "./input";

describe("Load configuration", () => {
  it("should return collections", () => {
    const result = loadConfig("kitchen-sink.yml");

    expect(result.length).toBeDefined();
  });

  it("should throw if invalid filetype", () => {
    const t = () => loadConfig("src/input.ts");
    expect(t).toThrow("Invalid filetype, must be an yaml file");
  });

  it("should throw if malformed config file", () => {
    const t = () => loadConfig(".github/workflows/build-test.yml");
    expect(t).toThrow("Failed loading collections from config file");
  });
});
