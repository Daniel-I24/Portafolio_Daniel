import { describe, expect, it } from "vitest";
import { entitySchemas, platformKinds, platformsFromKind, profileSchema, projectSchema } from "./schemas";

const minimalProject = { id: "p1", slug: "luma", title: "Luma" };

describe("projectSchema", () => {
  it("fills defaults for a minimal row", () => {
    const project = projectSchema.parse(minimalProject);
    expect(project).toMatchObject({ platforms: ["web"], summary: "", stack: [], repoUrl: "", featured: false, order: 0, published: true });
  });

  it("turns null optional texts and links into empty strings (seed and DB rows)", () => {
    const project = projectSchema.parse({ ...minimalProject, summary: null, liveUrl: null, problem: undefined });
    expect(project.summary).toBe("");
    expect(project.liveUrl).toBe("");
    expect(project.problem).toBe("");
  });

  it("accepts one or several platforms, never none or unknown ones", () => {
    expect(projectSchema.safeParse({ ...minimalProject, platforms: [...platformKinds] }).success).toBe(true);
    expect(projectSchema.parse({ ...minimalProject, platforms: ["mobile", "wearable"] }).platforms).toEqual(["mobile", "wearable"]);
    expect(projectSchema.safeParse({ ...minimalProject, platforms: [] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...minimalProject, platforms: ["tv"] }).success).toBe(false);
  });

  it("maps the old single kind (rows before migration 0003) to platforms", () => {
    expect(platformsFromKind("web-mobile")).toEqual(["web", "mobile"]);
    expect(platformsFromKind("wearable")).toEqual(["wearable"]);
    expect(platformsFromKind("tv")).toEqual(["web"]);
  });

  it("rejects bad slugs and bad links", () => {
    expect(projectSchema.safeParse({ ...minimalProject, slug: "Luma App" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...minimalProject, repoUrl: "github.com/x" }).success).toBe(false);
  });

  it("trims texts and enforces their maximum length", () => {
    expect(projectSchema.parse({ ...minimalProject, title: "  Luma  " }).title).toBe("Luma");
    expect(projectSchema.safeParse({ ...minimalProject, summary: "x".repeat(401) }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  const profile = { fullName: "Ivan Daniel", displayName: "Daniel Igua", tag: "Dani", role: "Dev", email: "dev@example.com" };

  it("parses a minimal profile with defaults", () => {
    expect(profileSchema.parse(profile)).toMatchObject({ goal: "", photo: "", cvUrl: "/cv.pdf", socials: [] });
  });

  it("validates the e-mail and social links", () => {
    expect(profileSchema.safeParse({ ...profile, email: "nope" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, socials: [{ kind: "github", label: "GitHub", url: "notaurl" }] }).success).toBe(false);
  });
});

describe("entitySchemas", () => {
  it("covers every editable table", () => {
    expect(Object.keys(entitySchemas).sort()).toEqual(["experience", "interests", "projects", "skills", "testimonials"]);
  });
});
