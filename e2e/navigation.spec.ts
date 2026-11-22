import { expect, test, type Page } from "@playwright/test";
import { curtainLog, isMobile, openHome } from "./helpers";

/** Waits until the curtain has come and gone, then returns every appearance. */
async function settledCurtain(page: Page) {
  await expect.poll(async () => (await curtainLog(page)).at(-1)?.gone, { timeout: 4_000 }).toBeTruthy();
  await page.waitForTimeout(600); // room for a second appearance, if there were one
  return curtainLog(page);
}

test.describe("menus and section curtain", () => {
  test("desktop menu: jumps to the section, marks it and shows the curtain once, long enough to read", async ({ page }) => {
    test.skip(isMobile(page), "desktop bar only");
    await openHome(page);
    const link = page.getByRole("navigation", { name: "Secciones" }).getByRole("link", { name: "Proyectos" });
    await link.click();
    const runs = await settledCurtain(page);
    expect(runs).toHaveLength(1);
    expect(runs[0].text).toMatch(/04\s*—\s*Proyectos/);
    expect(runs[0].gone! - runs[0].shown).toBeGreaterThan(800); // about 900 ms on screen
    await expect(page).toHaveURL(/#proyectos$/);
    await expect(page.locator("#proyectos")).toBeInViewport();
    await expect(link).toHaveAttribute("aria-current", "location");

    // Scrolling and the active-section change afterwards never raise it again.
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(800);
    expect(await curtainLog(page)).toHaveLength(1);
  });

  test("mobile floating menu: opens, closes with Esc and navigates with one curtain", async ({ page }) => {
    test.skip(!isMobile(page), "floating button only below 1280 px");
    await openHome(page);
    const button = page.getByRole("button", { name: /Abrir menú/ });
    await button.click();
    const panel = page.getByRole("dialog", { name: "Menú" });
    await expect(panel).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await panel.getByRole("link", { name: /Contacto/ }).click();
    const runs = await settledCurtain(page);
    expect(runs).toHaveLength(1);
    expect(runs[0].text).toMatch(/08\s*—\s*Contacto/);
    await expect(page.locator("#contacto")).toBeInViewport();
  });

  test("with animations off the menu jumps without a curtain", async ({ page }) => {
    await openHome(page, { motion: "off" });
    if (isMobile(page)) {
      await page.getByRole("button", { name: /Abrir menú/ }).click();
      await page.getByRole("dialog", { name: "Menú" }).getByRole("link", { name: /Sobre mí/ }).click();
    } else {
      await page.getByRole("navigation", { name: "Secciones" }).getByRole("link", { name: "Sobre mí" }).click();
    }
    await expect(page.locator("#sobre-mi")).toBeInViewport();
    expect(await curtainLog(page)).toHaveLength(0);
  });
});
