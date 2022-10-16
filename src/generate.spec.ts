import { loadConfig } from "./input";
import { generateTypes } from "./generate";

describe("Output testing", () => {
  it("should parse kitchen sink correctly", () => {
    const config = loadConfig("kitchen-sink.yml");

    expect(generateTypes(config, { label: false })).toMatchSnapshot();
  });

  it("should parse kitchen sink with label option", () => {
    const config = loadConfig("kitchen-sink.yml");

    expect(generateTypes(config, { label: true })).toMatchSnapshot();
  });

  it("should support capitalization of type names", () => {
    const config = loadConfig("kitchen-sink.yml");

    expect(generateTypes(config, { capitalize: true })).toMatchSnapshot();
  });

  it("should support custom delimiter for type names", () => {
    const config = loadConfig("kitchen-sink.yml");

    expect(generateTypes(config, { delimiter: "-" })).toMatchSnapshot();
  });

  it("should support label, capitalization and delimiter at the same time", () => {
    const config = loadConfig("kitchen-sink.yml");

    expect(
      generateTypes(config, { label: true, capitalize: true, delimiter: "" }),
    ).toMatchSnapshot();
  });
});
