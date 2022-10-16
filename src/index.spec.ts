import createNetlifyTypes from "./index";

describe("Program API", () => {
  describe("Synchronous", () => {
    it("should throw error", () => {
      const t = () => createNetlifyTypes("404");
      expect(t).toThrow();
    });
  });
});
