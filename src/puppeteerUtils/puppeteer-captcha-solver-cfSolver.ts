// https://github.com/zfcsoftware/puppeteer-captcha-solver/blob/main/lib/cfSolver.js

import type { Page } from 'puppeteer'


const checkCaptcha = async (page: Page) => {
  const checkFC = await page.evaluate(() => {
    let global_status = false

    try {
      document.querySelectorAll('iframe').forEach((el) => {
        if (el.src.indexOf('/cdn-cgi/challenge-platform/h/b/turnstile') > -1) {
          global_status = true
          return
        }
      })
      return global_status
    } catch (err) {
      return global_status
    }
  }).catch((_err) => {
    return false
  })
  return checkFC
}

const CPsolve = async (page: Page) => {
  try {
    const frames = page.frames().filter(frame => frame.url().indexOf('/cdn-cgi/challenge-platform/h/b/turnstile') > -1)

    if (frames.length > 0) {
      for (const item of frames) {
        try {
          await item.click('body')

          const active_frame = item.childFrames()[0]

          if (active_frame) {
            await active_frame.hover('[type="checkbox"]').catch(err => { })
            await active_frame.click('[type="checkbox"]').catch(err => { })
          }

          await new Promise(r => setTimeout(r, 500))
        } catch (err) {
          console.log(err)
        }
      }
    }
  } catch (err) { }
}

const pageState = async (page: Page) => {
  try {
    const isPageClosed = () => !page || page.isClosed()
    if (isPageClosed() === true) {
      return false
    } else {
      return true
    }
  } catch (err) {
    return false
  }
}

const cron = async (page: Page) => {
  let status = await pageState(page)
  while (status === true) {
    const cp_status = await checkCaptcha(page)
    if (cp_status === true) {
      await CPsolve(page)
    }
    await new Promise(r => setTimeout(r, 500))
    status = await pageState(page)
  }
  return true
}

export default cron