import { flatten } from "./utils";

describe("Flatten polyfill", () => {
  it("should flatten array", () => {
    expect(
      flatten(
        [],
        [
          [[1], 2],
          [3, 4, [5]],
        ],
      ),
    ).toEqual([1, 2, 3, 4, 5]);
  });
});
