import { loadConfig } from "./input";
import { generateTypes } from "./generate";

describe("Output testing", () => {
  it("should parse kitchen sink correctly", () => {
    const collections = loadConfig("kitchen-sink.yml");

    expect(generateTypes(collections, { label: false })).toMatchSnapshot();
  });

  it("should parse kitchen sink with label option", () => {
    const collections = loadConfig("kitchen-sink.yml");

    expect(generateTypes(collections, { label: true })).toMatchSnapshot();
  });

  it("should support capitalization of type names", () => {
    const collections = loadConfig("kitchen-sink.yml");

    expect(generateTypes(collections, { capitalize: true })).toMatchSnapshot();
  });
});
