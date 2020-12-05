import { Widget } from "../types";
import { nestedDepth, transformType, wrapEnum, pullType } from "./transform";

describe("Widget transformation", () => {
  const parse = (widget: Widget, prefix?: string) => transformType(prefix)([[], []], widget);

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

  describe("code", () => {
    it("should object type to object", () => {
      expect(
        parse(
          {
            name: "snippet",
            required: true,
            multiple: false,
            type: [
              { name: "code", type: "string", required: true, multiple: false },
              { name: "lang", type: "string", required: true, multiple: false },
            ],
          },
          "parent",
        ),
      ).toEqual([
        ["snippet: parent_snippet;"],
        ["interface parent_snippet { code: string; lang: string; }"],
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

  describe("typed lists", () => {
    it("should parse typed lists", () => {
      expect(
        parse(
          {
            name: "list",
            required: true,
            multiple: true,
            type: [
              [
                "__typename",
                {
                  name: "one",
                  required: true,
                  multiple: false,
                  type: [
                    {
                      name: "key",
                      type: "string",
                      required: true,
                      multiple: false,
                    },
                  ],
                },
                {
                  name: "two",
                  required: true,
                  multiple: false,
                  type: [{ name: "id", type: "number", required: true, multiple: false }],
                },
              ],
            ],
          },
          "parent",
        ),
      ).toEqual([
        ["list: (parent_list_one | parent_list_two)[];"],
        [
          `interface parent_list_one { __typename: "one"; key: string; }`,
          `interface parent_list_two { __typename: "two"; id: number; }`,
        ],
      ]);
    });

    it("should parse typed lists with objects", () => {
      expect(
        parse(
          {
            name: "list",
            required: true,
            multiple: true,
            type: [
              [
                "type",
                {
                  name: "one",
                  required: true,
                  multiple: false,
                  type: [
                    {
                      name: "key",
                      required: true,
                      multiple: false,
                      type: [
                        {
                          name: "deep",
                          required: true,
                          multiple: false,
                          type: "string",
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "two",
                  required: true,
                  multiple: false,
                  type: [{ name: "id", type: [1, 2, 3], required: true, multiple: false }],
                },
              ],
            ],
          },
          "parent",
        ),
      ).toEqual([
        ["list: (parent_list_one | parent_list_two)[];"],
        [
          `type parent_list_two_id_options = 1 | 2 | 3;`,
          `interface parent_list_one_key { deep: string; }`,
          `interface parent_list_one { type: "one"; key: parent_list_one_key; }`,
          `interface parent_list_two { type: "two"; id: parent_list_two_id_options; }`,
        ],
      ]);
    });
  });

  describe("select", () => {
    it("should parse select options", () => {
      expect(
        parse({
          name: "name",
          required: true,
          multiple: false,
          type: ["one", "two", "three"],
        }),
      ).toEqual([["name: name_options;"], [`type name_options = "one" | "two" | "three";`]]);
    });

    it("should parse numeric select options", () => {
      expect(
        parse({
          name: "name",
          required: true,
          multiple: false,
          type: [1, 2, 3],
        }),
      ).toEqual([["name: name_options;"], [`type name_options = 1 | 2 | 3;`]]);
    });

    it("should namespace type", () => {
      expect(
        parse(
          {
            name: "name",
            required: true,
            multiple: false,
            type: ["one", "two", "three"],
          },
          "parent",
        ),
      ).toEqual([
        ["name: parent_name_options;"],
        [`type parent_name_options = "one" | "two" | "three";`],
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

describe("Nested list depth", () => {
  it("should return correct depth", () => {
    expect(
      nestedDepth({
        name: "list",
        required: true,
        multiple: true,
        type: {
          name: "nested",
          required: true,
          multiple: true,
          type: "boolean",
        },
      }),
    ).toEqual({ depth: 2, optional: false });
  });
});

describe("Enum wrapping", () => {
  it("should parse strings", () => {
    expect(wrapEnum("string")).toEqual(`"string"`);
  });

  it("should parse numbers", () => {
    expect(wrapEnum(1)).toEqual(`1`);
  });
});

describe("Pull typename", () => {
  it("should pull type name", () => {
    expect(pullType("one: parent_list_one;")).toEqual("parent_list_one");
  });
});
