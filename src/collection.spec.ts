import { pullCollection } from "./collection";

describe("Pull collection", () => {
  it("should support file collections", () => {
    expect(
      pullCollection({
        name: "file",
        widget: "root",
        fields: [],
      }),
    ).toEqual([
      {
        name: "file",
        widget: "root",
        fields: [],
      },
    ]);
  });

  it("should support folder collections", () => {
    expect(
      pullCollection({
        name: "folder",
        widget: "root",
        files: [
          {
            name: "folder",
            widget: "root",
            fields: [],
          },
        ],
        fields: [],
      }),
    ).toEqual([
      {
        name: "folder",
        widget: "root",
        fields: [],
      },
    ]);
  });
});
