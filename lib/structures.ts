/** Lowercases and strips accents so "Nariño" matches "narino". */
export const normalize = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

type Row = Record<string, unknown>;

/** snake_case DB columns → camelCase schema fields. */
export const toCamel = (row: Row): Row =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()), v]));

/** camelCase schema fields → snake_case DB columns. */
export const toSnake = (row: Row): Row =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`), v]));

class TrieNode<T> {
  readonly children = new Map<string, TrieNode<T>>();
  readonly values = new Set<T>();
}

/** Prefix search used by the bubble menu and the admin table. Every word of a label is indexed. */
export class Trie<T> {
  private readonly root = new TrieNode<T>();

  insert(label: string, value: T): this {
    for (const word of normalize(label).split(/\s+/).filter(Boolean)) {
      let node = this.root;
      for (const char of word) {
        let next = node.children.get(char);
        if (!next) {
          next = new TrieNode<T>();
          node.children.set(char, next);
        }
        node = next;
        node.values.add(value);
      }
    }
    return this;
  }

  /** Values whose label has a word starting with every word of the query. */
  search(query: string): T[] {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const sets = words.map((word) => this.find(word));
    const [first, ...rest] = sets;
    return [...first].filter((value) => rest.every((set) => set.has(value)));
  }

  private find(prefix: string): Set<T> {
    let node: TrieNode<T> | undefined = this.root;
    for (const char of prefix) {
      node = node.children.get(char);
      if (!node) return new Set();
    }
    return node.values;
  }
}

/** Fixed ring of items with a moving cursor; drives the testimonial carousel. */
export class CircularQueue<T> {
  private cursor = 0;

  constructor(private readonly items: readonly T[]) {}

  get size(): number { return this.items.length; }
  get index(): number { return this.cursor; }
  get current(): T | undefined { return this.items[this.cursor]; }

  next(): T | undefined { return this.move(1); }
  prev(): T | undefined { return this.move(-1); }

  goTo(index: number): T | undefined {
    if (this.size === 0) return undefined;
    this.cursor = ((index % this.size) + this.size) % this.size;
    return this.current;
  }

  /** The current item followed by the next `count - 1` items, wrapping around. */
  window(count: number): T[] {
    const length = Math.min(count, this.size);
    return Array.from({ length }, (_, i) => this.items[(this.cursor + i) % this.size]);
  }

  private move(step: number): T | undefined {
    return this.goTo(this.cursor + step);
  }
}

/** Inverted index technology → items, used by the project filter. */
export class TechIndex<T extends { stack: string[] }> {
  private readonly index = new Map<string, Set<T>>();

  constructor(private readonly items: readonly T[]) {
    for (const item of items) {
      for (const tech of item.stack) {
        const bucket = this.index.get(tech) ?? new Set<T>();
        bucket.add(item);
        this.index.set(tech, bucket);
      }
    }
  }

  /** Technologies sorted by how many items use them, then alphabetically. */
  techs(): string[] {
    return [...this.index.entries()]
      .sort(([a, x], [b, y]) => y.size - x.size || a.localeCompare(b, "es"))
      .map(([tech]) => tech);
  }

  /** Items using the technology, keeping the original order; all items when tech is null. */
  filter(tech: string | null): T[] {
    if (!tech) return [...this.items];
    const bucket = this.index.get(tech);
    return bucket ? this.items.filter((item) => bucket.has(item)) : [];
  }
}

/** Stable sort by `order` ascending (Array#sort is stable since ES2019). */
export const byOrder = <T extends { order: number }>(items: readonly T[]): T[] =>
  [...items].sort((a, b) => a.order - b.order);

/** Stable sort by a numeric date key (year, timestamp…), most recent first; ties keep their order. */
export const byNewest = <T>(items: readonly T[], key: (item: T) => number): T[] =>
  [...items].sort((a, b) => key(b) - key(a));
