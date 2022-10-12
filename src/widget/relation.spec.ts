import { resolveRelations } from "./relation";

describe("resolveRelation", () => {
  const types = [
    'type authors_status_options = "active" | "inactive";',
    "interface publisher { name: string; }",
    "interface authors_location { city: string; zip: number; }",
    "interface authors { name: string; location: authors_location; publisher: ~publisher/name; status: authors_status_options; }",
  ];

  it("should resolve simple relations", () => {
    const input = [...types, "interface posts { title: string; author?: ~authors/name; }"];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; author?: string; }",
    );
  });

  it("should resolve nested relations", () => {
    const input = [
      ...types,
      "interface posts { title: string; author_zip: ~authors/location.zip; }",
    ];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; author_zip: number; }",
    );
  });

  it("should resolve object relations", () => {
    const input = [...types, "interface posts { title: string; author: ~authors/*; }"];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; author: authors; }",
    );
  });

  it("should resolve nested object relations", () => {
    const input = [
      ...types,
      "interface posts { title: string; author_location: ~authors/location.*; }",
    ];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; author_location: authors_location; }",
    );
  });

  it("should resolve nested relations", () => {
    const input = [...types, "interface posts { title: string; publisher: ~authors/publisher; }"];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; publisher: string; }",
    );
  });

  it("should resolve literal relations", () => {
    const input = [...types, "interface posts { title: string; author_status: ~authors/status; }"];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; author_status: authors_status_options; }",
    );
  });

  it("should resolve list relations", () => {
    const input = [
      ...types,
      "interface posts_image { url: string; }",
      "interface posts { title: string; post_image: ~posts/image.*.url; }",
    ];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; post_image: string; }",
    );
  });

  it("should resolve list array relations", () => {
    const input = [
      ...types,
      "interface posts_image { url: string; }",
      "interface posts { title: string; post_images: ~posts/image.*.url[]; }",
    ];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; post_images: string[]; }",
    );
  });

  it("should resolve template relations", () => {
    const input = [...types, "interface posts { title: string; author: ~authors/{{slug}}; }"];

    expect(input.map(resolveRelations())[input.length - 1]).toEqual(
      "interface posts { title: string; author: string; }",
    );
  });

  it("should support custom delimiter", () => {
    const input = [
      "interface authors__location { city: string; }",
      "interface authors { location: authors__location; }",
      "interface posts { author__location: ~authors/location.*; }",
    ];

    expect(input.map(resolveRelations({ delimiter: "-" }))[input.length - 1]).toEqual(
      "interface posts { author__location: authors-location; }",
    );
  });
});
