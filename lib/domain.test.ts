import { describe, expect, it } from "vitest";
import { AcademicExperience, Interest, initialsOf, PLATFORM_LABELS, Project, shortPhrase, Testimonial, WorkExperience } from "./domain";
import { experienceSchema, interestSchema, platformKinds, profileSchema, projectSchema, testimonialSchema } from "./schemas";

const project = (data: Record<string, unknown>) => new Project(projectSchema.parse({ id: "p", slug: "p", title: "Proyecto", ...data }));
const hrefs = (p: Project) => p.links().map((link) => `${link.label} → ${link.href}`);

describe("Project.links (polymorphic by platform)", () => {
  it("puts Código first and the platform action second", () => {
    expect(hrefs(project({ platforms: ["web"], repoUrl: "https://g.co/r", liveUrl: "https://site.co" }))).toEqual([
      "Código → https://g.co/r", "Demo en vivo → https://site.co",
    ]);
  });

  it("phone + watch: the watch APK first, the phone APK from the extra links, no repeats", () => {
    const flux = project({ platforms: ["mobile", "wearable"], repoUrl: "https://g.co/r", apkUrl: "https://g.co/w.apk", extraLinks: [{ label: "APK del teléfono", url: "https://g.co/m.apk" }] });
    expect(hrefs(flux)).toEqual(["Código → https://g.co/r", "APK del reloj → https://g.co/w.apk", "APK del teléfono → https://g.co/m.apk"]);
  });

  it("a mobile app with a web demo offers the APK, then the demo", () => {
    const luma = project({ platforms: ["mobile"], repoUrl: "https://g.co/r", liveUrl: "https://site.co", apkUrl: "https://g.co/a.apk" });
    expect(hrefs(luma)).toEqual(["Código → https://g.co/r", "Descargar APK → https://g.co/a.apk", "Demo en vivo → https://site.co"]);
  });

  it("uses the custom label for the live link", () => {
    expect(project({ liveUrl: "https://site.co", liveLabel: "Ver negocio" }).links()[0].label).toBe("Ver negocio");
  });

  it("falls back to the README when only the code is linked", () => {
    expect(hrefs(project({ platforms: ["desktop"], repoUrl: "https://g.co/r" }))).toEqual([
      "Código → https://g.co/r", "Documentación → https://g.co/r#readme",
    ]);
  });
});

describe("Experience subclasses", () => {
  const row = { id: "e", period: "2024 — hoy", title: "Ingeniería" };

  it("each type answers badge, accent and icon its own way", () => {
    const academic = new AcademicExperience(experienceSchema.parse({ ...row, type: "academic" }));
    const work = new WorkExperience(experienceSchema.parse({ ...row, type: "work" }));
    expect([academic.badge(), academic.accent(), academic.icon()]).toEqual(["Académica", "sky", "shield"]);
    expect([work.badge(), work.accent(), work.icon()]).toEqual(["Laboral", "mist", "code"]);
    expect(work.toCard().tags).toEqual(["Laboral", "2024 — hoy"]);
  });

  it("sorts ongoing experience above dated ones", () => {
    const old = new WorkExperience(experienceSchema.parse({ ...row, type: "work", period: "nov. 2024" }));
    const current = new WorkExperience(experienceSchema.parse({ ...row, type: "work" }));
    expect(current.sortKey).toBeGreaterThan(old.sortKey);
  });
});

describe("small domain helpers", () => {
  it("initialsOf keeps two upper-case initials", () => {
    expect(initialsOf("daniel igua benavides")).toBe("DI");
    expect(initialsOf("Ana")).toBe("A");
  });

  it("testimonials and interests derive their visuals", () => {
    expect(new Testimonial(testimonialSchema.parse({ id: "t", name: "Diana Jojoa", quote: "Muy buen trabajo, recomendado." })).initials).toBe("DJ");
    expect(new Interest(interestSchema.parse({ id: "i", slug: "futbol", title: "Fútbol" })).icon).toBe("football");
  });

  it("shortPhrase prefers the tagline, else the first sentence of about", () => {
    const base = { fullName: "I D", displayName: "D I", tag: "D", role: "Dev", email: "d@e.co" };
    expect(shortPhrase(profileSchema.parse({ ...base, tagline: "Hola." }))).toBe("Hola.");
    expect(shortPhrase(profileSchema.parse({ ...base, about: "Primera. Segunda." }))).toBe("Primera.");
  });

  it("every platform has a visible label", () => {
    for (const platform of platformKinds) expect(PLATFORM_LABELS[platform]).toBeTruthy();
  });

  it("relevance ranks featured, then complete, then newest", () => {
    const [plain, rich, star] = [project({ period: "2026-2" }), project({ period: "2026-1", liveUrl: "https://s.co", problem: "x" }), project({ featured: true, period: "2025-1" })];
    const ranked = [plain, rich, star].sort((a, b) => a.relevance.reduce((d, v, i) => d || b.relevance[i] - v, 0));
    expect(ranked).toEqual([star, rich, plain]);
  });
});
