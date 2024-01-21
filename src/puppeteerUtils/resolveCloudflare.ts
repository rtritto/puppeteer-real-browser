import type { Page } from 'puppeteer'

// import { getFrame } from '@/puppeteerUtils/utils.ts'
// import cfSolver from '@/puppeteerUtils/puppeteer-captcha-solver-cfSolver.ts'
// import pcr from 'puppeteer-captcha-solver'
import { checkStat } from '@/puppeteerUtils/puppeteer_cloudflare_bypass.ts'


export const resolveCF = async (page: Page) => {
  // await cfSolver(page)
  // console.debug('Cloudflare resolved!')

  // while ((await page.title()).endsWith('EXT Torrents') === false) {
  //   console.debug('Try to resolve Cloudflare...')
  //   await checkStat(page)
  //   await page.content()
  //   await new Promise(r => setTimeout(r, 2000))
  // }
  // console.debug('Cloudflare resolved!')

  console.debug('Try to resolve Cloudflare...')
  while (true) {
    const resCheck = await checkStat(page)
    if (resCheck.code === 1) {
      // await page.content()  // ??? leave here and/or move after if
      console.debug('Cloudflare resolved!')
      return
    }

    // if ((await page.title()).endsWith('EXT Torrents') === true) {
    //   console.debug('Cloudflare resolved!')
    //   return
    // }
    // await new Promise(r => setTimeout(r, 2000))
  }

  // await pcr.autoSolve({
  //   page,
  //   config: {
  //     turnstile: true
  //   }
  // })
  // console.debug('Cloudflare resolved!')
}