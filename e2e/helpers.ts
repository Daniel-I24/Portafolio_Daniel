import type { Page } from "@playwright/test";

/** Skips the loader (as on a repeat visit) and records every run of the section curtain. */
export async function openHome(page: Page, options: { motion?: "on" | "off" } = {}) {
  await page.addInitScript((motion) => {
    sessionStorage.setItem("intro", "seen");
    // Only on the first load of the test: a reload must keep what the page itself saved.
    if (motion && !sessionStorage.getItem("e2e")) localStorage.setItem("motion", motion);
    sessionStorage.setItem("e2e", "1");
    // Each curtain appearance is logged with its text and when it came and went (ms), however fast it runs.
    const log: { text: string; shown: number; gone?: number }[] = [];
    Object.assign(window, { __curtain: log });
    new MutationObserver((records) => records.forEach((record) => {
      record.addedNodes.forEach((node) => node instanceof HTMLElement && node.dataset.curtain !== undefined && log.push({ text: node.textContent ?? "", shown: performance.now() }));
      record.removedNodes.forEach((node) => { if (node instanceof HTMLElement && node.dataset.curtain !== undefined) log[log.length - 1].gone = performance.now(); });
    })).observe(document, { childList: true, subtree: true });
  }, options.motion);
  await page.goto("/");
  // Wait for hydration: the motion switch only reacts once React is running.
  await page.waitForFunction(() => document.documentElement.dataset.ready !== undefined, null, { timeout: 15_000 });
}

type CurtainRun = { text: string; shown: number; gone?: number };
export const curtainLog = (page: Page) => page.evaluate(() => (window as unknown as { __curtain: CurtainRun[] }).__curtain);

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1280;
