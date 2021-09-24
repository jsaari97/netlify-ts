import { loadConfig } from "./input";
import { generateTypes } from "./generate";

describe("Output testing", () => {
  it("should parse kitchen sink correctly", () => {
    const collections = loadConfig("kitchen-sink.yml");

    expect(generateTypes(collections)).toMatchSnapshot();
  });
});
