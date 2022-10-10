import { resolveWidget, resolveType } from "./resolve";

describe("Resolve widget shape", () => {
  describe("multiple property", () => {
    it('should be false if "multiple" prop falsy', () => {
      expect(resolveWidget({ name: "name", widget: "string" }).multiple).toBe(false);
    });

    it('should be true if "multiple" prop true', () => {
      expect(
        resolveWidget({ name: "name", widget: "select", multiple: true, options: [] }).multiple,
      ).toBe(true);
    });

    it('should be true if "list" widget type', () => {
      expect(resolveWidget({ name: "name", widget: "list" }).multiple).toBe(true);
    });
  });

  describe("required property", () => {
    it("should be true by default", () => {
      expect(resolveWidget({ name: "name", widget: "string" }).required).toBe(true);
    });

    it("should be true if value truthy", () => {
      expect(resolveWidget({ name: "name", widget: "string", required: true }).required).toBe(true);
    });

    it("should be false if value is false", () => {
      expect(resolveWidget({ name: "name", widget: "string", required: false }).required).toBe(
        false,
      );
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(resolveType({ name: "name", widget: "number", value_type: "number" as any })).toEqual(
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

  test("file", () => {
    expect(resolveType({ name: "name", widget: "file" })).toEqual("string");
  });

  test("relation", () => {
    expect(
      resolveType({
        name: "name",
        widget: "relation",
        collection: "collection",
        value_field: "name.first",
      }),
    ).toEqual("~collection/name.first");
  });

  test("map", () => {
    expect(resolveType({ name: "name", widget: "map" })).toEqual("string");
  });

  describe("code", () => {
    it("should return object by default", () => {
      expect(resolveType({ name: "name", widget: "code" })).toEqual([
        { name: "code", type: "string", required: true, multiple: false },
        { name: "lang", type: "string", required: true, multiple: false },
      ]);
    });

    it("should return string by default", () => {
      expect(resolveType({ name: "name", widget: "code", output_code_only: true })).toEqual(
        "string",
      );
    });

    it("should return custom object if 'keys' exists", () => {
      expect(
        resolveType({ name: "name", widget: "code", keys: { code: "echo", lang: "bash" } }),
      ).toEqual([
        { name: "echo", type: "string", required: true, multiple: false },
        { name: "bash", type: "string", required: true, multiple: false },
      ]);
    });
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

    it("should return object if field is of type object", () => {
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

    describe("typed", () => {
      it("should resolve typed list", () => {
        expect(
          resolveType({
            name: "name",
            widget: "list",
            types: [
              { name: "one", widget: "object", fields: [{ name: "key", widget: "string" }] },
              { name: "two", widget: "object", fields: [{ name: "id", widget: "string" }] },
            ],
          }),
        ).toEqual([
          [
            "type",
            {
              name: "one",
              required: true,
              multiple: false,
              type: [{ name: "key", type: "string", required: true, multiple: false }],
            },
            {
              name: "two",
              required: true,
              multiple: false,
              type: [{ name: "id", type: "string", required: true, multiple: false }],
            },
          ],
        ]);
      });

      it("should respect typeKey", () => {
        expect(
          resolveType({
            name: "name",
            widget: "list",
            typeKey: "kind",
            types: [
              { name: "one", widget: "object", fields: [{ name: "key", widget: "string" }] },
              { name: "two", widget: "object", fields: [{ name: "id", widget: "string" }] },
            ],
          }),
        ).toEqual([
          [
            "kind",
            {
              name: "one",
              required: true,
              multiple: false,
              type: [{ name: "key", type: "string", required: true, multiple: false }],
            },
            {
              name: "two",
              required: true,
              multiple: false,
              type: [{ name: "id", type: "string", required: true, multiple: false }],
            },
          ],
        ]);
      });
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
          options: [
            { label: "Label", value: "one" },
            { label: "Label", value: "two" },
            { label: "Label", value: "three" },
          ],
        }),
      ).toEqual(["one", "two", "three"]);
    });

    it("should resolve numeric options", () => {
      expect(resolveType({ name: "name", widget: "select", options: [1, 2, 3] })).toEqual([
        1, 2, 3,
      ]);
    });

    it("should resolve key-value numeric options", () => {
      expect(
        resolveType({
          name: "name",
          widget: "select",
          options: [
            { label: "Label", value: 1 },
            { label: "Label", value: 2 },
            { label: "Label", value: 3 },
          ],
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
