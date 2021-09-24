import { createNetlifyTypes, createNetlifyTypesAsync } from "./index";

describe("Program API", () => {
  describe("Synchronous", () => {
    it("should throw error", () => {
      const t = () => createNetlifyTypes("404");
      expect(t).toThrow();
    });
  });

  describe("Asynchronous", () => {
    it("should reject", async () => {
      expect(createNetlifyTypesAsync("404")).rejects.toBeTruthy();
    });
  });
});
