import { buildWidget, buildType } from "./widgets";

describe("Widgets", () => {
  test("string", () => {
    expect(buildWidget({ name: "name", widget: "string" })).toEqual({
      name: "name",
      type: "string",
    });
  });

  test("number", () => {
    expect(buildWidget({ name: "name", widget: "number" })).toEqual({
      name: "name",
      type: "string",
    });

    expect(buildWidget({ name: "name", widget: "number", value_type: "int" })).toEqual({
      name: "name",
      type: "number",
    });

    expect(buildWidget({ name: "name", widget: "number", value_type: "float" })).toEqual({
      name: "name",
      type: "number",
    });

    expect(buildWidget({ name: "name", widget: "number", value_type: "number" })).toEqual({
      name: "name",
      type: "string",
    });
  });

  test("boolean", () => {
    expect(buildWidget({ name: "name", widget: "boolean" })).toEqual({
      name: "name",
      type: "boolean",
    });
  });

  test("hidden", () => {
    expect(buildWidget({ name: "name", widget: "hidden" })).toEqual({
      name: "name",
      type: "any",
    });
  });

  test("markdown", () => {
    expect(buildWidget({ name: "name", widget: "markdown" })).toEqual({
      name: "name",
      type: "string",
    });
  });

  test("relation", () => {
    expect(buildWidget({ name: "name", widget: "relation" })).toEqual({
      name: "name",
      type: "any",
    });
  });

  test("list", () => {
    expect(
      buildWidget({ name: "name", widget: "list", fields: [{ name: "child", widget: "string" }] }),
    ).toEqual({
      name: "name",
      type: [[{ name: "child", type: "string" }]],
    });

    expect(buildWidget({ name: "name", widget: "list" })).toEqual({
      name: "name",
      type: [[]],
    });
  });

  test("select", () => {
    expect(
      buildWidget({ name: "name", widget: "select", options: ["one", "two", "three"] }),
    ).toEqual({
      name: "name",
      type: ["one", "two", "three"],
    });
  });

  test("object", () => {
    expect(
      buildWidget({
        name: "name",
        widget: "object",
        fields: [{ name: "child", widget: "string" }],
      }),
    ).toEqual({
      name: "name",
      type: [{ name: "child", type: "string" }],
    });
  });
});

describe("Types", () => {
  it("should parse primitives", () => {
    expect(buildType()([[], []], { name: "name", type: "string" })).toEqual([
      ["name: string;"],
      [],
    ]);

    expect(buildType()([[], []], { name: "name", type: "boolean" })).toEqual([
      ["name: boolean;"],
      [],
    ]);
  });

  it("should not extract top-level types", () => {
    expect(
      buildType()([[], []], {
        name: "top",
        type: [
          { name: "name", type: "string" },
        ],
      }),
    ).toEqual([[], [`interface top { name: string; }`]]);
  });

  it("should parse objects", () => {
    expect(
      buildType("test")([[], []], {
        name: "name",
        type: [
          { name: "name", type: "string" },
          { name: "active", type: "boolean" },
        ],
      }),
    ).toEqual([["name: test_name;"], [`interface test_name { name: string; active: boolean; }`]]);
  });

  it("should parse array objects", () => {
    expect(
      buildType("test")([[], []], {
        name: "name",
        type: [
          [
            { name: "name", type: "string" },
            { name: "active", type: "boolean" },
          ],
        ],
      }),
    ).toEqual([["name: test_name[];"], [`interface test_name { name: string; active: boolean; }`]]);

    expect(
      buildType("test")([[], []], {
        name: "name",
        type: [[]],
      }),
    ).toEqual([["name: string[];"], []]);
  });

  it("should parse select options", () => {
    expect(
      buildType()([[], []], {
        name: "name",
        type: [["one", "two", "three"]],
      }),
    ).toEqual([["name: name_options;"], [`type name_options = 'one' | 'two' | 'three';`]]);
  });
});
