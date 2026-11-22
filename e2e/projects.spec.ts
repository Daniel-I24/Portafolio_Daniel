import { expect, test } from "@playwright/test";
import { openHome } from "./helpers";

test.describe("projects", () => {
  test.beforeEach(async ({ page }) => {
    await openHome(page, { motion: "off" });
    await page.locator("#proyectos").scrollIntoViewIfNeeded();
  });

  const cards = (page: import("@playwright/test").Page) => page.locator("#proyectos article");

  test("platform filters: a project counts under each of its platforms", async ({ page }) => {
    const filters = page.getByRole("group", { name: "Filtrar por plataforma" });
    const all = await cards(page).count();
    await filters.getByRole("button", { name: /^Wearable/ }).click();
    await expect(filters.getByRole("button", { name: /^Wearable/ })).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText("FLUX");

    await filters.getByRole("button", { name: /^Móvil/ }).click();
    await expect(cards(page)).toHaveCount(2); // Luma and FLUX (phone + watch)

    await filters.getByRole("button", { name: /^Todos/ }).click();
    await expect(cards(page)).toHaveCount(all);
  });

  test("gallery: arrows and keyboard move it, the counter follows", async ({ page }) => {
    const counter = page.locator("#proyectos p[aria-live][aria-atomic]");
    await expect(counter).toContainText(/01 \/ \d{2}/);
    const next = page.getByRole("button", { name: "Proyecto siguiente" });
    await next.click();
    await expect(counter).not.toContainText(/^Proyecto 01/);
    await expect(page.getByRole("button", { name: "Proyecto anterior" })).toBeEnabled();

    const track = page.getByRole("list", { name: /Galería de proyectos/ });
    await track.focus();
    await page.keyboard.press("End");
    await expect(next).toBeDisabled();
    await page.keyboard.press("Home");
    await expect(counter).toContainText(/01 \/ \d{2}/);
  });

  test("detail modal opens from the card, closes with Esc and returns focus", async ({ page }) => {
    const open = page.getByRole("button", { name: "Ver detalle de Luma" });
    await open.click();
    const dialog = page.getByRole("dialog", { name: "Luma" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Descargar APK/ })).toHaveAttribute("href", /\.apk$/);
    await expect(dialog.getByRole("link", { name: /Demo en vivo/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
  });
});
