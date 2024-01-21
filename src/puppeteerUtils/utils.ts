import type { Page } from 'puppeteer'

export const getFrame = async (page: Page, regex: RegExp) => {
  while (true) {
    const frame = page.frames().find((f) => regex.test(f.url()))
    if (frame) {
      return frame
    }
    await new Promise(r => setTimeout(r, 1000))
  }
}