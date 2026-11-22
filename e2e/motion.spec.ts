import { expect, test } from "@playwright/test";
import { isMobile, openHome } from "./helpers";

test("animations switch: pauses everything, is remembered and turns back on", async ({ page }) => {
  await openHome(page, { motion: "on" });
  const html = page.locator("html");
  const openMenu = async () => {
    if (!isMobile(page)) return page.getByRole("banner");
    await page.getByRole("button", { name: /Abrir menú/ }).click();
    return page.getByRole("dialog", { name: "Menú" });
  };

  let scope = await openMenu();
  await scope.getByRole("button", { name: "Pausar animaciones" }).click();
  await expect(html).toHaveAttribute("data-motion", "off");
  await expect(scope.getByRole("button", { name: "Activar animaciones" })).toHaveAttribute("aria-pressed", "true");
  // Scroll-linked reveals stop as well.
  const reveal = page.locator(".reveal").first();
  expect(await reveal.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");

  await page.reload();
  await expect(html).toHaveAttribute("data-motion", "off");
  scope = await openMenu();
  await scope.getByRole("button", { name: "Activar animaciones" }).click();
  await expect(html).toHaveAttribute("data-motion", "on");
});
