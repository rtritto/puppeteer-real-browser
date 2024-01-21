import { launch, Launcher } from 'chrome-launcher'
import chromium from '@sparticuz/chromium-min'
import CDP from 'chrome-remote-interface'
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import Xvfb from 'xvfb'
import clc from 'cli-color'
import { request } from 'undici'
import { getExtensionFilePaths } from '@/puppeteerUtils/extensions'

interface Args {
  proxy?: {
    host: string,
    port: number,
    username?: string,
    password?: string
  },
  action?: string,
  headless?: boolean,
  executablePath?: string
  extensionPath?: boolean
}

export const puppeteerRealBrowser = async (args: Args) => {
  let xvfbSession

  if (process.platform !== 'linux') {
    switch (args.headless) {
      case true:
        chromium.setHeadlessMode = 'new'
        break
      case false:
        break
    }
  } else {
    chromium.setHeadlessMode = 'new'
    if (args.headless === false) {
      console.log(clc.yellow('[WARNING] [PUPPETEER-REAL-BROWSER] | On the Linux platform you can only run the browser in headless true mode.'))
    }
  }

  // https://pptr.dev/guides/chrome-extensions
  const flags = Launcher.defaultFlags().filter((flag) => flag !== '--disable-extensions')

  if (args.extensionPath === true) {
    const extensionPaths = getExtensionFilePaths()

    for (const filepath of extensionPaths) {
      flags.push(
        `--disable-extensions-except=${filepath}`,
        `--load-extension=${filepath}`
      )
    }
  }

  // flags.push(
  //   '--enable-automation'
  //   '--no-sandbox'
  //   '--headless'
  // )

  if (args.proxy && args.proxy.host && args.proxy.host.length > 0) {
    flags.push(`--proxy-server=${args.proxy.host}:${args.proxy.port}`)
  }

  if (process.platform === 'linux') {
    try {
      xvfbSession = new Xvfb({
        silent: true,
        xvfb_args: ['-screen', '0', '1280x720x24', '-ac']
      })
      xvfbSession.startSync()
    } catch (err) {
      console.log(clc.red('[ERROR] [PUPPETEER-REAL-BROWSER] | You are running on a Linux platform but do not have xvfb installed. The browser can be captured. Please install it with the following command\n\nsudo apt-get install xvfb'))
      console.log(err.message)
    }
  }

  const getExecutablePath = async () => {
    if (args.executablePath !== 'default') {
      return args.executablePath
    }

    return await chromium.executablePath()
  }

  const chrome = await launch({
    chromePath: await getExecutablePath(),
    chromeFlags: flags,
    ignoreDefaultFlags: true
  })
  const protocol = await CDP({ port: chrome.port })

  const { Network, Page, Runtime } = protocol

  await Promise.all([Runtime.enable(), Network.enable(), Page.enable()])
  await Page.setLifecycleEventsEnabled({ enabled: true })

  const responseData = await request('http://localhost:' + chrome.port + '/json/version').then((response) => response.body.json()) as Record<any, any>
  const data = {
    browserWSEndpoint: responseData.webSocketDebuggerUrl,
    agent: responseData['User-Agent']
  }

  puppeteer.use(
    AdblockerPlugin({
      // Optionally enable Cooperative Mode for several request interceptors
      interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
    })
  )

  const browser = await puppeteer.connect({
    targetFilter: (target) => !!target.url(),
    browserWSEndpoint: data.browserWSEndpoint
  })

  browser.close = async () => {
    if (protocol) {
      await protocol.close()
    }

    if (chrome) {
      chrome.kill()
    }

    if (xvfbSession) {
      xvfbSession.stopSync()
    }
  }

  const page = (await browser.pages())[0]

  if (args.proxy && args.proxy.username && args.proxy.password && args.proxy.username.length > 0 && args.proxy.password.length > 0) {
    await page.authenticate({
      username: args.proxy.username,
      password: args.proxy.password
    })
  }

  await page.setUserAgent(data.agent)
  await page.setViewport({ width: 1920, height: 1080 })

  return {
    browser,
    page
  }
}