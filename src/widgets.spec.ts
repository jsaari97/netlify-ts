import { buildWidget, buildType, resolveType } from "./widgets";

describe("Build Widget shape", () => {
  expect(buildWidget({ name: "name", widget: "string" })).toEqual({
    name: "name",
    type: "string",
    required: true,
  });

  expect(buildWidget({ name: "name", widget: "string", required: false })).toEqual({
    name: "name",
    type: "string",
    required: false,
  });

  expect(buildWidget({ name: "name", widget: "string" })).toEqual({
    name: "name",
    type: "string",
    required: true,
  });
});

describe("Resolve widget type", () => {
  test("string", () => {
    expect(resolveType({ name: "name", widget: "string" })).toEqual("string");
  });

  test("number", () => {
    expect(resolveType({ name: "name", widget: "number" })).toEqual("string");

    expect(resolveType({ name: "name", widget: "number", value_type: "int" })).toEqual("number");

    expect(resolveType({ name: "name", widget: "number", value_type: "float" })).toEqual("number");

    expect(resolveType({ name: "name", widget: "number", value_type: "number" })).toEqual("string");
  });

  test("boolean", () => {
    expect(resolveType({ name: "name", widget: "boolean" })).toEqual("boolean");
  });

  test("hidden", () => {
    expect(resolveType({ name: "name", widget: "hidden" })).toEqual("any");
  });

  test("markdown", () => {
    expect(resolveType({ name: "name", widget: "markdown" })).toEqual("string");
  });

  test("relation", () => {
    expect(resolveType({ name: "name", widget: "relation" })).toEqual("any");
  });

  test("list", () => {
    expect(
      resolveType({
        name: "name",
        widget: "list",
        fields: [{ name: "child", widget: "string" }],
      }),
    ).toEqual([[{ name: "child", type: "string", required: true }]]);

    expect(resolveType({ name: "name", widget: "list" })).toEqual([[]]);
  });

  test("select", () => {
    expect(
      resolveType({ name: "name", widget: "select", options: ["one", "two", "three"] }),
    ).toEqual(["one", "two", "three"]);

    expect(
      resolveType({
        name: "name",
        widget: "select",
        options: [{ value: "one" }, { value: "two" }, { value: "three" }],
      }),
    ).toEqual(["one", "two", "three"]);
  });

  test("object", () => {
    expect(
      resolveType({
        name: "name",
        widget: "object",
        fields: [{ name: "child", widget: "string" }],
      }),
    ).toEqual([{ name: "child", type: "string", required: true }]);
  });
});

describe("Types", () => {
  it("should parse primitives", () => {
    expect(buildType()([[], []], { name: "name", type: "string", required: true })).toEqual([
      ["name: string;"],
      [],
    ]);

    expect(buildType()([[], []], { name: "name", type: "boolean", required: true })).toEqual([
      ["name: boolean;"],
      [],
    ]);
  });

  it("should not extract top-level types", () => {
    expect(
      buildType()([[], []], {
        name: "top",
        required: true,
        type: [{ name: "name", type: "string", required: true }],
      }),
    ).toEqual([[], [`interface top { name: string; }`]]);
  });

  it("should parse objects", () => {
    expect(
      buildType("test")([[], []], {
        name: "name",
        required: true,
        type: [
          { name: "name", type: "string", required: true },
          { name: "active", type: "boolean", required: true },
        ],
      }),
    ).toEqual([["name: test_name;"], [`interface test_name { name: string; active: boolean; }`]]);
  });

  it("should parse array objects", () => {
    expect(
      buildType("test")([[], []], {
        name: "name",
        required: true,
        type: [
          [
            { name: "name", type: "string", required: true },
            { name: "active", type: "boolean", required: true },
          ],
        ],
      }),
    ).toEqual([["name: test_name[];"], [`interface test_name { name: string; active: boolean; }`]]);

    expect(
      buildType("test")([[], []], {
        name: "name",
        required: true,
        type: [[]],
      }),
    ).toEqual([["name: string[];"], []]);
  });

  it("should parse select options", () => {
    expect(
      buildType()([[], []], {
        name: "name",
        required: true,
        type: [["one", "two", "three"]],
      }),
    ).toEqual([["name: name_options;"], [`type name_options = 'one' | 'two' | 'three';`]]);

    expect(
      buildType("root")([[], []], {
        name: "name",
        required: true,
        type: [["one", "two", "three"]],
      }),
    ).toEqual([
      ["name: root_name_options;"],
      [`type root_name_options = 'one' | 'two' | 'three';`],
    ]);
  });
});
