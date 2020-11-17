import { formatType } from "./output";

describe("Type formatting", () => {
  it("should format interfaces", () => {
    expect(formatType("interface A { name: string; age: number; }")).toEqual(
      "interface A {\n  name: string;\n  age: number;\n}",
    );
  });

  it("should format type literals", () => {
    expect(formatType("type A = 'one' | 'two' | 'three';")).toEqual(
      "type A = 'one' | 'two' | 'three';",
    );
  });
});
