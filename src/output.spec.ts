import { appendExport, formatType, outputFile } from "./output";
import path from "path";
import { promises as fs } from "fs";
import { OUTPUT_FILENAME } from "./constants";

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

describe("Type formatting", () => {
  it("should format interfaces", () => {
    expect(formatType("interface A { name: string; age: number; }")).toEqual(
      "interface A {\n  name: string;\n  age: number;\n}",
    );
  });

  it("should format type literals", () => {
    expect(formatType(`type A = "one" | "two" | "three";`)).toEqual(
      `type A = "one" | "two" | "three";`,
    );
  });
});

describe(`Appending 'export'`, () => {
  it("should append keyword", () => {
    expect(appendExport("interface MyInterface {}")).toEqual("export interface MyInterface {}");
  });
});

describe("File outputting", () => {
  it("should output file", async () => {
    await outputFile("./test.ts", "dummy data");

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(__dirname, "../test.ts"),
      "dummy data",
      "utf8",
    );
  });

  it("should append filename", async () => {
    await outputFile("./", "dummy data");

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(__dirname, "../", OUTPUT_FILENAME),
      "dummy data",
      "utf8",
    );
  });

  it("should create directory if it does not exist", async () => {
    await outputFile("./__404", "dummy data");

    const outputPath = path.resolve(__dirname, "../__404");

    expect(fs.mkdir).toHaveBeenCalledWith(outputPath, { recursive: true });

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(outputPath, OUTPUT_FILENAME),
      "dummy data",
      "utf8",
    );
  });
});
