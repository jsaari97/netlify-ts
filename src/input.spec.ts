import { loadConfig } from "./input";

describe("Load configuration", () => {
  it("should return collections", async () => {
    const result = await loadConfig("kitchen-sink.yml");

    expect(result.length).toBeDefined();
  });

  it("should throw if invalid filetype", async () => {
    expect(loadConfig("src/input.ts")).rejects.toEqual("Invalid filetype, must be an yaml file");
  });

  it("should throw if malformed config file", async () => {
    expect(loadConfig(".github/workflows/build-test.yml")).rejects.toEqual(
      "Failed loading collections from config file",
    );
  });
});
