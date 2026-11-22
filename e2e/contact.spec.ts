import { expect, test } from "@playwright/test";
import { openHome } from "./helpers";

test.describe("contact form validation", () => {
  test.beforeEach(async ({ page }) => {
    await openHome(page, { motion: "off" });
    await page.locator("#contacto").scrollIntoViewIfNeeded();
  });

  test("an empty submit lists what is missing", async ({ page }) => {
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByText("Escribe tu correo para poder responderte.")).toBeVisible();
    await expect(page.getByText("Escribe tu mensaje.")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Nombre" })).toHaveAttribute("aria-invalid", "true");
  });

  test("checks each field as you leave it", async ({ page }) => {
    const email = page.getByRole("textbox", { name: "Correo" });
    await email.fill("daniel@correo");
    await email.blur();
    await expect(page.getByText("Revisa el correo: debe verse como nombre@dominio.com.")).toBeVisible();
    await email.fill("daniel@correo.com");
    await expect(email).toHaveAttribute("aria-invalid", "false");

    const message = page.getByRole("textbox", { name: "Mensaje" });
    await message.fill("Hola");
    await message.blur();
    await expect(page.getByText("Cuéntame un poco más (mínimo 10 caracteres).")).toBeVisible();
    await expect(page.locator("#contact-message-count")).toContainText("4 / 2000");
  });
});
