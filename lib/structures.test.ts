import { describe, expect, it } from "vitest";
import { byNewest, byOrder, CircularQueue, normalize, periodKey, TechIndex, toCamel, toSnake, Trie } from "./structures";

describe("normalize", () => {
  it("lowercases, trims and strips accents", () => {
    expect(normalize("  Nariño ÁÉÍ ")).toBe("narino aei");
  });
});

describe("toCamel / toSnake", () => {
  it("round-trips column names", () => {
    const row = { repo_url: "x", live_label: "y", order: 1 };
    expect(toCamel(row)).toEqual({ repoUrl: "x", liveLabel: "y", order: 1 });
    expect(toSnake(toCamel(row))).toEqual(row);
  });
});

describe("Trie", () => {
  const trie = new Trie<number>().insert("Spring Boot", 1).insert("Angular", 2).insert("Spring Security", 3);

  it("finds every word by prefix, ignoring accents and case", () => {
    expect(trie.search("spr").sort()).toEqual([1, 3]);
    expect(trie.search("BOOT")).toEqual([1]);
  });

  it("requires every query word to match", () => {
    expect(trie.search("spring sec")).toEqual([3]);
  });

  it("returns nothing for empty or unknown queries", () => {
    expect(trie.search("   ")).toEqual([]);
    expect(trie.search("react")).toEqual([]);
  });
});

describe("CircularQueue", () => {
  it("wraps around in both directions", () => {
    const queue = new CircularQueue(["a", "b", "c"]);
    expect(queue.current).toBe("a");
    expect(queue.prev()).toBe("c");
    expect(queue.next()).toBe("a");
    expect(queue.goTo(7)).toBe("b");
    expect(queue.index).toBe(1);
  });

  it("returns a wrapping window from the cursor", () => {
    const queue = new CircularQueue([1, 2, 3]);
    queue.goTo(2);
    expect(queue.window(2)).toEqual([3, 1]);
    expect(queue.window(5)).toEqual([3, 1, 2]);
  });

  it("is safe when empty", () => {
    const queue = new CircularQueue<number>([]);
    expect(queue.next()).toBeUndefined();
    expect(queue.window(3)).toEqual([]);
  });
});

describe("TechIndex", () => {
  const items = [{ id: 1, tags: ["web"] }, { id: 2, tags: ["api", "web"] }, { id: 3, tags: ["game"] }];
  const index = new TechIndex(items, (item) => item.tags);

  it("counts and filters by tag, keeping the original order", () => {
    expect(index.count("web")).toBe(2);
    expect(index.count(null)).toBe(3);
    expect(index.filter("web").map((i) => i.id)).toEqual([1, 2]);
    expect(index.filter("desktop")).toEqual([]);
    expect(index.filter(null)).toHaveLength(3);
  });

  it("sorts tags by usage, then alphabetically", () => {
    expect(index.techs()).toEqual(["web", "api", "game"]);
  });
});

describe("periodKey", () => {
  const now = new Date(2026, 10, 21);

  it("orders semesters, months and bare years", () => {
    expect(periodKey("2026-2", now)).toBe(202612);
    expect(periodKey("2026-1", now)).toBe(202606);
    expect(periodKey("nov. 2024", now)).toBe(202411);
    expect(periodKey("2023", now)).toBe(202312);
  });

  it("ranks ongoing periods first", () => {
    expect(periodKey("2024 — hoy", now)).toBeGreaterThan(periodKey("2026-2", now));
  });
});

describe("sorting helpers", () => {
  it("sorts by order without mutating the input", () => {
    const input = [{ order: 2 }, { order: 0 }, { order: 1 }];
    expect(byOrder(input).map((i) => i.order)).toEqual([0, 1, 2]);
    expect(input[0].order).toBe(2);
  });

  it("puts the newest first and keeps ties stable", () => {
    const input = [{ k: 1, id: "a" }, { k: 3, id: "b" }, { k: 1, id: "c" }];
    expect(byNewest(input, (i) => i.k).map((i) => i.id)).toEqual(["b", "a", "c"]);
  });
});
