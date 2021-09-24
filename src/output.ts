import path from "path";
import fs from "fs";
import { OUTPUT_FILENAME } from "./constants";

const spacing = "  ";

export const formatType = (type: string): string => {
  return type
    .replace("{ ", `{\n${spacing}`)
    .replace(/;\s/g, `;\n${spacing}`)
    .replace(`${spacing}}`, "}");
};

export const appendExport = (type: string): string => `export ${type}`;

export const outputFile = (outputPath: string, data: string): void => {
  let fullPath = path.join(process.cwd(), outputPath);

  if (!path.extname(fullPath)) {
    fullPath = path.join(fullPath, OUTPUT_FILENAME);
  }

  if (path.dirname(fullPath) !== process.cwd()) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  }

  fs.writeFileSync(fullPath, data, "utf8");
};
