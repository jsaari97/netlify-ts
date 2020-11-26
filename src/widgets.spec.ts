import { Widget } from "./types";
import { buildWidget, buildType, resolveType } from "./widgets";

describe("Build Widget shape", () => {
  describe("multiple property", () => {
    it('should be false if "multiple" prop falsy', () => {
      expect(buildWidget({ name: "name", widget: "string" }).multiple).toBe(false);
    });

    it('should be true if "multiple" prop true', () => {
      expect(buildWidget({ name: "name", widget: "string", multiple: true }).multiple).toBe(true);
    });

    it('should be true if "list" widget type', () => {
      expect(buildWidget({ name: "name", widget: "list" }).multiple).toBe(true);
    });
  });

  describe("required property", () => {
    it("should be true by default", () => {
      expect(buildWidget({ name: "name", widget: "string" }).required).toBe(true);
    });

    it("should be true if value truthy", () => {
      expect(buildWidget({ name: "name", widget: "string", required: true }).required).toBe(true);
    });

    it("should be false if value is false", () => {
      expect(buildWidget({ name: "name", widget: "string", required: false }).required).toBe(false);
    });
  });
});

describe("Resolve widget type", () => {
  describe("string", () => {
    it("should return string if widget equals string", () => {
      expect(resolveType({ name: "name", widget: "string" })).toEqual("string");
    });
  });

  describe("number", () => {
    it("should return string if no value_type", () => {
      expect(resolveType({ name: "name", widget: "number" })).toEqual("string");
    });

    it("should return number if value_type is int or float", () => {
      expect(resolveType({ name: "name", widget: "number", value_type: "int" })).toEqual("number");
      expect(resolveType({ name: "name", widget: "number", value_type: "float" })).toEqual(
        "number",
      );
    });

    it("should return string if value_type is invalid", () => {
      expect(resolveType({ name: "name", widget: "number", value_type: "number" })).toEqual(
        "string",
      );
    });
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

  describe("list", () => {
    it("should return string type if no field or fields prop provided", () => {
      expect(
        resolveType({
          name: "name",
          widget: "list",
        }),
      ).toEqual("string");
    });

    it("should return primitive if field is set", () => {
      expect(
        resolveType({
          name: "name",
          widget: "list",
          field: { name: "child", widget: "boolean" },
        }),
      ).toEqual("boolean");
    });

    it("should be optional if primitive field is", () => {
      expect(
        resolveType({
          name: "name",
          widget: "list",
          field: { name: "child", widget: "boolean", required: false },
        }),
      ).toEqual("boolean?");
    });

    it("should return XXX if field is set", () => {
      expect(
        resolveType({
          name: "name",
          widget: "list",
          field: { name: "child", widget: "object", fields: [{ name: "prop", widget: "boolean" }] },
        }),
      ).toEqual({
        name: "child",
        required: true,
        multiple: false,
        type: [{ name: "prop", required: true, multiple: false, type: "boolean" }],
      });
    });

    it("should resolve nested single lists", () => {
      expect(
        resolveType({
          name: "parent",
          widget: "list",
          field: {
            name: "child",
            widget: "list",
            field: {
              name: "grandchild",
              widget: "list",
              field: {
                name: "prop",
                widget: "string",
              },
            },
          },
        }),
      ).toEqual({
        name: "child",
        required: true,
        multiple: true,
        type: {
          name: "grandchild",
          required: true,
          multiple: true,
          type: "string",
        },
      });
    });

    it("should resolve nested single lists with special", () => {
      expect(
        resolveType({
          name: "parent",
          widget: "list",
          field: {
            name: "child",
            widget: "list",
            field: {
              name: "grandchild",
              widget: "list",
              field: {
                name: "obj",
                widget: "object",
                fields: [{ name: "prop", widget: "string" }],
              },
            },
          },
        }),
      ).toEqual({
        name: "child",
        required: true,
        multiple: true,
        type: {
          name: "grandchild",
          required: true,
          multiple: true,
          type: {
            name: "obj",
            required: true,
            multiple: false,
            type: [
              {
                name: "prop",
                required: true,
                multiple: false,
                type: "string",
              },
            ],
          },
        },
      });
    });

    it("should return list of child fields if fields is set", () => {
      expect(
        resolveType({
          name: "name",
          widget: "list",
          fields: [{ name: "child", widget: "string" }],
        }),
      ).toEqual([{ name: "child", type: "string", required: true, multiple: false }]);
    });
  });

  describe("select", () => {
    it("should resolve primitive options", () => {
      expect(
        resolveType({ name: "name", widget: "select", options: ["one", "two", "three"] }),
      ).toEqual(["one", "two", "three"]);
    });

    it("should resolve key-value options", () => {
      expect(
        resolveType({
          name: "name",
          widget: "select",
          options: [{ value: "one" }, { value: "two" }, { value: "three" }],
        }),
      ).toEqual(["one", "two", "three"]);
    });

    it("should resolve numeric options", () => {
      expect(resolveType({ name: "name", widget: "select", options: [1, 2, 3] })).toEqual([
        1,
        2,
        3,
      ]);
    });

    it("should resolve key-value numeric options", () => {
      expect(
        resolveType({
          name: "name",
          widget: "select",
          options: [{ value: 1 }, { value: 2 }, { value: 3 }],
        }),
      ).toEqual([1, 2, 3]);
    });
  });

  describe("object", () => {
    it("should resolve multiple fields", () => {
      expect(
        resolveType({
          name: "name",
          widget: "object",
          fields: [
            { name: "one", widget: "string" },
            { name: "two", widget: "boolean" },
          ],
        }),
      ).toEqual([
        { name: "one", type: "string", required: true, multiple: false },
        { name: "two", type: "boolean", required: true, multiple: false },
      ]);
    });
  });
});

describe("Type generation", () => {
  const parse = (widget: Widget, prefix?: string) => buildType(prefix)([[], []], widget);

  describe("top-level", () => {
    it("should not extract top-level types", () => {
      expect(
        parse({
          name: "top",
          required: true,
          multiple: false,
          type: [{ name: "name", type: "string", required: true, multiple: false }],
        }),
      ).toEqual([[], [`interface top { name: string; }`]]);
    });
  });

  describe("string", () => {
    it("should parse correctly", () => {
      expect(parse({ name: "name", type: "string", required: true, multiple: false })).toEqual([
        ["name: string;"],
        [],
      ]);
    });
  });

  describe("boolean", () => {
    it("should parse correctly", () => {
      expect(parse({ name: "name", type: "boolean", required: true, multiple: false })).toEqual([
        ["name: boolean;"],
        [],
      ]);
    });
  });

  describe("object", () => {
    it("should parse correctly", () => {
      expect(
        parse(
          {
            name: "profile",
            required: true,
            multiple: false,
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          "parent",
        ),
      ).toEqual([
        ["profile: parent_profile;"],
        [`interface parent_profile { name: string; active: boolean; }`],
      ]);
    });
  });

  describe("list", () => {
    it("should parse array objects", () => {
      expect(
        parse(
          {
            name: "list",
            required: true,
            multiple: true,
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          "parent",
        ),
      ).toEqual([
        ["list: parent_list[];"],
        ["interface parent_list { name: string; active: boolean; }"],
      ]);
    });

    it("should parse simple single field list", () => {
      expect(
        parse(
          {
            name: "list",
            required: true,
            multiple: true,
            type: "boolean",
          },
          "parent",
        ),
      ).toEqual([["list: boolean[];"], []]);
    });

    it("should parse simple single field list as optional", () => {
      expect(
        parse(
          {
            name: "list",
            required: true,
            multiple: true,
            type: "boolean?",
          },
          "parent",
        ),
      ).toEqual([["list?: boolean[];"], []]);
    });

    it("should parse object single field list", () => {
      expect(
        parse(
          {
            name: "list",
            required: true,
            multiple: true,
            type: {
              name: "item",
              required: true,
              multiple: false,
              type: [{ name: "prop", required: true, multiple: false, type: "boolean" }],
            },
          },
          "parent",
        ),
      ).toEqual([["list: parent_list_item[];"], ["interface parent_list_item { prop: boolean; }"]]);
    });

    it("should parse default list", () => {
      expect(
        parse(
          {
            name: "name",
            required: true,
            multiple: true,
            type: "string",
          },
          "parent",
        ),
      ).toEqual([["name: string[];"], []]);
    });
  });

  describe("nested lists", () => {
    it("should parse nested single field list", () => {
      expect(
        parse(
          {
            name: "list",
            required: true,
            multiple: true,
            type: {
              name: "nested",
              required: true,
              multiple: true,
              type: "boolean",
            },
          },
          "parent",
        ),
      ).toEqual([["list: boolean[][];"], []]);
    });

    it("should parse nested single field object list", () => {
      expect(
        parse(
          {
            name: "child",
            required: true,
            multiple: true,
            type: {
              name: "grandchild",
              required: true,
              multiple: true,
              type: {
                name: "item",
                required: true,
                multiple: false,
                type: [
                  {
                    name: "prop",
                    required: true,
                    multiple: false,
                    type: "string",
                  },
                ],
              },
            },
          },
          "parent",
        ),
      ).toEqual([
        ["child: parent_child_grandchild_item[][];"],
        ["interface parent_child_grandchild_item { prop: string; }"],
      ]);
    });

    it("should parse mixed nested single field object list (field > fields)", () => {
      expect(
        parse(
          {
            name: "child",
            required: true,
            multiple: true,
            type: {
              name: "grandchild",
              required: true,
              multiple: true,
              type: [
                { name: "title", required: true, multiple: false, type: "string" },
                {
                  name: "item",
                  required: true,
                  multiple: false,
                  type: [
                    {
                      name: "prop",
                      required: true,
                      multiple: false,
                      type: "string",
                    },
                  ],
                },
              ],
            },
          },
          "parent",
        ),
      ).toEqual([
        ["child: parent_child_grandchild[][];"],
        [
          "interface parent_child_grandchild_item { prop: string; }",
          "interface parent_child_grandchild { title: string; item: parent_child_grandchild_item; }",
        ],
      ]);
    });

    it("should parse mixed nested single field object list (fields > field)", () => {
      expect(
        parse(
          {
            name: "child",
            required: true,
            multiple: true,
            type: [
              { name: "title", required: true, multiple: false, type: "string" },
              {
                name: "items",
                required: true,
                multiple: true,
                type: {
                  name: "row",
                  required: false,
                  multiple: true,
                  type: [{ name: "label", required: true, multiple: false, type: "string" }],
                },
              },
            ],
          },
          "parent",
        ),
      ).toEqual([
        ["child: parent_child[];"],
        [
          "interface parent_child_items_row { label: string; }",
          "interface parent_child { title: string; items?: parent_child_items_row[][]; }",
        ],
      ]);
    });
  });

  describe("select", () => {
    it("should parse select options", () => {
      expect(
        buildType()([[], []], {
          name: "name",
          required: true,
          multiple: false,
          type: ["one", "two", "three"],
        }),
      ).toEqual([["name: name_options;"], [`type name_options = "one" | "two" | "three";`]]);
    });

    it("should parse numeric select options", () => {
      expect(
        buildType()([[], []], {
          name: "name",
          required: true,
          multiple: false,
          type: [1, 2, 3],
        }),
      ).toEqual([["name: name_options;"], [`type name_options = 1 | 2 | 3;`]]);
    });

    it("should namespace type", () => {
      expect(
        buildType("root")([[], []], {
          name: "name",
          required: true,
          multiple: false,
          type: ["one", "two", "three"],
        }),
      ).toEqual([
        ["name: root_name_options;"],
        [`type root_name_options = "one" | "two" | "three";`],
      ]);
    });
  });

  describe("any", () => {
    it("should resolve any to any", () => {
      expect(
        parse(
          {
            name: "name",
            type: "any",
            required: true,
            multiple: false,
          },
          "parent",
        ),
      ).toEqual([["name: any;"], []]);
    });

    it("should resolve 'any' array", () => {
      expect(
        parse(
          {
            name: "name",
            type: "any",
            required: true,
            multiple: true,
          },
          "parent",
        ),
      ).toEqual([["name: any[];"], []]);
    });
  });
});
