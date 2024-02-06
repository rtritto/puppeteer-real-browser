import { parse } from 'node-html-parser'
import { puppeteerRealBrowser } from 'puppeteer-real-browser'
import { request } from 'undici'

// import { downloadExtensions, extractZipExtensions } from '@/puppeteerUtils/extensions.ts'
import { resolveCF } from '@/puppeteerUtils/resolveCloudflare'

const getUrlExt = (filter: string, page: number) => `https://ext.to/search/${filter}/${page}/?order=seed&sort=desc&c=movies`
const URL_EXT_RESET = 'https://ext.to/ajax/torrentUpdatePeers.php'
const MAX_CONCURRENT_REQUESTS = 5

// await downloadExtensions()
// await extractZipExtensions()

const { browser, page } = await puppeteerRealBrowser({ /* extensionPath: true */ })

const filter = ''

let len = 1

for (let i = 0; i < len; i++) {
  const pageNumber = i + 1
  const urlExt = getUrlExt(filter, pageNumber)
  await page.goto(urlExt, { waitUntil: 'domcontentloaded' })
  if (pageNumber === 1) {
    await resolveCF(page)
  }
  await page.waitForSelector('tbody')
  const html = await page.content()
  const root = parse(html)

  //#region set len
  if (pageNumber === 1) {
    const paginationBlock = root.querySelector('.pagination-block')
    const pageLink = paginationBlock?.querySelectorAll('a.page-link')
    len = parseInt(pageLink?.at(-2)?.rawText as string)
  }
  console.log(`pageNumber: ${pageNumber}/${len}`)
  //#endregion

  const tbody = root.querySelector('tbody')
  const tds = tbody?.querySelectorAll('td.text-left')
  // const hrefs = tds?.map((e) => e.querySelector('a')?.getAttribute('href'))  // get only first <a>
  const dataIds = tds?.map((e) => e
    .querySelector('div.btn-blocks.float-right')
    ?.querySelector('a.dwn-btn.torrent-dwn')
    ?.getAttribute('data-id')
  ) as string[]
  for (let i = 0, len = dataIds.length; i < len; i += MAX_CONCURRENT_REQUESTS) {
    const chunk = dataIds.slice(i, i + MAX_CONCURRENT_REQUESTS)
    await Promise.all(chunk.map((dataId) => request(URL_EXT_RESET, {
      method: 'POST',
      body: `id=${dataId}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      }
    }).then(async (r) => console.log(await r.body.json()))))
  }
}

await browser.close()
console.log('END!');