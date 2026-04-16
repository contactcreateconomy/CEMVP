import { describe, it, expect } from "vitest";
import { getCategoryTemplate } from "../registry";

describe("Category Registry", () => {
  it("returns a template for every valid category key", () => {
    const keys = [
      "news",
      "review",
      "compare",
      "launch-pad",
      "debate",
      "help",
      "list",
      "showcase",
      "gigs",
    ];
    keys.forEach((key) => {
      const template = getCategoryTemplate(key);
      expect(template).not.toBeNull();
      expect(template?.key).toBe(key);
      expect(template?.Body).toBeDefined();
    });
  });

  it("returns null for unknown category key", () => {
    expect(getCategoryTemplate("unknown-category")).toBeNull();
  });
});
