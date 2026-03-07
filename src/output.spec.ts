import { appendExport, formatType, outputFile } from "./output.js";
import path from "path";
import fs from "fs";
import { jest } from "@jest/globals";
import { fileURLToPath } from "url";
import { OUTPUT_FILENAME } from "./constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeEach(() => {
  jest.spyOn(fs, "existsSync").mockReturnValue(true);
  jest.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
  jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined as unknown as string);
});

afterEach(() => {
  jest.restoreAllMocks();
});

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
  it("should output file", () => {
    outputFile("./test.ts", "dummy data");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve(__dirname, "../test.ts"),
      "dummy data",
      "utf8",
    );
  });

  it("should append filename", () => {
    outputFile("./", "dummy data");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve(__dirname, "../", OUTPUT_FILENAME),
      "dummy data",
      "utf8",
    );
  });

  it("should create directory if it does not exist", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    outputFile("./__404", "dummy data");

    const outputPath = path.resolve(__dirname, "../__404");

    expect(fs.mkdirSync).toHaveBeenCalledWith(outputPath, { recursive: true });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve(outputPath, OUTPUT_FILENAME),
      "dummy data",
      "utf8",
    );
  });
});
