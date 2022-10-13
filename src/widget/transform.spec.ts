import type { Widget } from "../types";
import {
  nestedDepth,
  transformType,
  wrapEnum,
  pullType,
  sortTypes,
  TransformState,
  toCapitalized,
  toCamelCase,
} from "./transform";

describe("Widget transformation", () => {
  const parse = (widget: Widget, state?: TransformState) => transformType(state)([[], []], widget);

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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
        ),
      ).toEqual([
        ["child: parent_child[];"],
        [
          "interface parent_child_items_row { label: string; }",
          "interface parent_child { title: string; items?: parent_child_items_row[][]; }",
        ],
      ]);
    });

    describe("relations", () => {
      it("should passthrough relations", () => {
        expect(
          parse({ name: "name", type: "~posts/some.path", required: false, multiple: true }),
        ).toEqual([["name?: ~posts/some.path[];"], []]);
      });
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
                  name: "type_one",
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
          { prefix: "parent" },
        ),
      ).toEqual([
        ["list: (parent_list_type_one | parent_list_two)[];"],
        [
          `interface parent_list_type_one { __typename: "type_one"; key: string; }`,
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
          { prefix: "parent" },
        ),
      ).toEqual([
        ["list: (parent_list_one | parent_list_two)[];"],
        [
          `interface parent_list_one_key { deep: string; }`,
          `type parent_list_two_id_options = 1 | 2 | 3;`,
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
          { prefix: "parent" },
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
          { prefix: "parent" },
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
          { prefix: "parent" },
        ),
      ).toEqual([["name: any[];"], []]);
    });
  });

  describe("body", () => {
    it('should omit fields with name "body"', () => {
      expect(parse({ name: "body", type: "string", required: true, multiple: false })).toEqual([
        [],
        [],
      ]);
    });
  });

  describe("'label' option", () => {
    it("should use singularLabel", () => {
      expect(
        parse(
          {
            name: "users",
            required: true,
            multiple: true,
            singularLabel: "User",
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          { prefix: "parent", label: true },
        ),
      ).toEqual([
        ["users: parent_User[];"],
        ["interface parent_User { name: string; active: boolean; }"],
      ]);
    });

    it("should use label as fallback", () => {
      expect(
        parse(
          {
            name: "users",
            required: true,
            multiple: true,
            label: "Users",
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          { prefix: "parent", label: true },
        ),
      ).toEqual([
        ["users: parent_Users[];"],
        ["interface parent_Users { name: string; active: boolean; }"],
      ]);
    });

    it("should use name if no label found", () => {
      expect(
        parse(
          {
            name: "users",
            required: true,
            multiple: true,
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          { prefix: "parent", label: true },
        ),
      ).toEqual([
        ["users: parent_users[];"],
        ["interface parent_users { name: string; active: boolean; }"],
      ]);
    });
  });

  describe("'capitalize' option", () => {
    it("should capitalize names", () => {
      expect(
        parse(
          {
            name: "users",
            required: true,
            multiple: true,
            singularLabel: "User",
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          { prefix: "parent", capitalize: true },
        ),
      ).toEqual([
        ["users: Parent_Users[];"],
        ["interface Parent_Users { name: string; active: boolean; }"],
      ]);
    });

    it("should work together with label option", () => {
      expect(
        parse(
          {
            name: "users",
            required: true,
            multiple: true,
            singularLabel: "user",
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          { prefix: "parent", capitalize: true, label: true },
        ),
      ).toEqual([
        ["users: Parent_User[];"],
        ["interface Parent_User { name: string; active: boolean; }"],
      ]);
    });
  });

  describe("'delimiter' option", () => {
    it("should customize the name delimiter", () => {
      expect(
        parse(
          {
            name: "users",
            required: true,
            multiple: true,
            singularLabel: "User",
            type: [
              { name: "name", type: "string", required: true, multiple: false },
              { name: "active", type: "boolean", required: true, multiple: false },
            ],
          },
          { prefix: "parent", delimiter: "-" },
        ),
      ).toEqual([
        ["users: parent-users[];"],
        ["interface parent-users { name: string; active: boolean; }"],
      ]);
    });
  });

  it("should parse typed lists with labels", () => {
    expect(
      parse(
        {
          name: "list",
          label: "my_list",
          required: true,
          multiple: true,
          type: [
            [
              "__typename",
              {
                name: "type_one",
                label: "type one",
                required: true,
                multiple: false,
                type: [
                  {
                    name: "key",
                    singularLabel: "my key",
                    type: "string",
                    required: true,
                    multiple: false,
                  },
                ],
              },
              {
                name: "two",
                label: "type_two",
                required: true,
                multiple: false,
                type: [
                  {
                    name: "id",
                    singularLabel: "my_id",
                    type: "number",
                    required: true,
                    multiple: false,
                  },
                ],
              },
            ],
          ],
        },
        { prefix: "parent", label: true },
      ),
    ).toEqual([
      ["list: (parent_my_list_typeOne | parent_my_list_type_two)[];"],
      [
        `interface parent_my_list_typeOne { __typename: "type_one"; key: string; }`,
        `interface parent_my_list_type_two { __typename: "two"; id: number; }`,
      ],
    ]);
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

describe("Type sorting", () => {
  it("should sort matching matching types to end of list", () => {
    const pattern = /(typed_object_1|typed_object_2)\s{/;
    const types = [
      "type typed_object_1_options = 1 | 2;",
      "interface typed_object_1 { opts: typed_object_1_options; }",
      "interface typed_object_2_child { id: number; }",
      "interface typed_object_2 { child: typed_object_2_child; }",
    ];

    expect(types.sort(sortTypes(pattern))).toEqual([
      "type typed_object_1_options = 1 | 2;",
      "interface typed_object_2_child { id: number; }",
      "interface typed_object_1 { opts: typed_object_1_options; }",
      "interface typed_object_2 { child: typed_object_2_child; }",
    ]);
  });
});

describe("Pull typename", () => {
  it("should pull type name", () => {
    expect(pullType("one: parent_list_one;")).toEqual("parent_list_one");
  });
});

describe("toCamelCase", () => {
  it("should camelCase words separated by any non-alphanumeric characters", () => {
    const str = "this is  a_string.with!non-alphanumeric#delimiters";
    expect(toCamelCase(str)).toBe("thisIsAStringWithNonAlphanumericDelimiters");
  });
});

describe("toCapitalized", () => {
  it("should capitalize words separated by any non-alphanumeric characters", () => {
    const str = "this is  a_string.with!non-alphanumeric#delimiters";
    expect(toCapitalized(str)).toBe("This Is  A_String.With!Non-Alphanumeric#Delimiters");
  });
});
