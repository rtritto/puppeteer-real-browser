// https://github.com/zfcsoftware/youtube_lessons_resources/blob/main/puppeteer_cloudflare_bypass/index.js

import type { Page } from 'puppeteer'

export const checkStat = async (page: Page) => {
  const st = setTimeout(() => {
    return {
      code: 1
    }
  }, 3000)
  try {
    const checkStat = await page.evaluate(() => {
      const htmlRaw = document.querySelector('html')
      if (htmlRaw) {
        const html = String(htmlRaw.innerHTML).toLowerCase()
        if (html.indexOf('challenges.cloudflare.com/turnstile') > -1) {
          return 1
        }
      } else {
        return 2
      }
      return 0
    })
    if (checkStat !== 0) {
      try {
        // await new Promise(r => setTimeout(r, 5000))
        await new Promise(r => setTimeout(r, 3000))

        await page.click('body')
        await new Promise(r => setTimeout(r, 500))

        await page.keyboard.press('Tab')
        await new Promise(r => setTimeout(r, 500))

        await page.keyboard.press('Space')
        // await new Promise(r => setTimeout(r, 10000))

        // let frame = page.frames()[0]
        // frame = frame.childFrames()[0]
        // if (frame) {
        //   await frame.hover('[type="checkbox"]').catch(err => { })
        //   await frame.click('[type="checkbox"]').catch(err => { })
        // }
      } catch (err) {
        // console.log('err: ', err)
      }
    }
    clearInterval(st)
    return {
      code: checkStat
    }
  } catch (err) {
    clearInterval(st)
    return {
      code: 1
    }
  }
}


// const send = ({ url = '', proxy = {} }) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       var { puppeteerRealBrowser } = await import('puppeteer-real-browser')
//       var data = {}
//       if (proxy && proxy.host && proxy.host.length > 0) {
//         data.proxy = proxy
//       }
//       puppeteerRealBrowser = await puppeteerRealBrowser(data)
//       var browser = puppeteerRealBrowser.browser
//       var page = puppeteerRealBrowser.page
//       try {
//         await page.goto(url, { waitUntil: 'domcontentloaded' })

//         var stat = await checkStat({
//           page: page
//         })

//         while (stat.code !== 0) {
//           await new Promise(r => setTimeout(r, 500))
//           stat = await checkStat({
//             page: page
//           })
//         }
//         resolve({
//           code: 200,
//           message: 'OK',
//           data: {
//             browser: browser,
//             page: page
//           }
//         })

//       } catch (err) {
//         await browser.close()
//         resolve({
//           code: 501,
//           message: err.message
//         })
//       }

//     } catch (error) {
//       resolve({
//         code: 500,
//         message: error.message
//       })
//     }

//   })
// }



// send({
//   url: '<url>',
//   // proxy: {
//   //     host: '<host>',
//   //     port: '<port>',
//   //     username: '<username>',
//   //     password: '<password>',
//   // }
// })
//   .then(resp => {
//     console.log(resp)
//   })