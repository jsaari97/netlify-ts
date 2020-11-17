import path from "path";
import { promises as fs } from "fs";

const spacing = "  ";

export const formatType = (type: string): string => {
  return type
    .replace("{ ", `{\n${spacing}`)
    .replace(/;\s/g, `;\n${spacing}`)
    .replace(`${spacing}}`, "}");
};

export const appendExport = (type: string): string => `export ${type}`;

export const outputFile = async (outputPath: string, data: string): Promise<void> => {
  try {
    let fullPath = path.join(process.cwd(), outputPath);

    if (!path.extname(fullPath)) {
      fullPath = path.join(fullPath, "/netlify.types.ts");
    }

    if (path.dirname(fullPath) !== process.cwd()) {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
    }

    await fs.writeFile(fullPath, data, "utf8");
  } catch (error) {
    return Promise.reject(error);
  }
};
