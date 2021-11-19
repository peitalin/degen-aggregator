
import { logger } from "./utils/logger";
import * as puppeteer from "puppeteer";


// https://techblog.willshouse.com/2012/01/03/most-common-user-agents/
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
]


export const initPuppetBrowser = async (skipImageLoading = false) => {

  const browser = await puppeteer.launch({
    headless: true,
    // headless: false, // only on desktop/local
    // executablePath: '/usr/bin/chromium-browser',
    // for headless: true mode
    args: [
      '--no-sandbox',
      // '--proxy-server=' + proxy,
    ]
  });

  const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max)
  }

  const page = await browser.newPage()

  // Set Random user-agent
  let randomUserAgent = userAgents[getRandomInt(userAgents.length)]
  logger.info("userAgent: %s", randomUserAgent)
  await page.setUserAgent(randomUserAgent)

  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })

  // push console.log from headless-browser back to node.js process
  await page.on('console', msg => console.log(msg.text()))
  // push console.log errors from headless-browser back to node.js process
  await page.on('error', err => console.log(err))

  // block image requests to save bandwidth and minimize request timeouts
	await page.setRequestInterception(true);
	await page.on('request', (req) => {

    // console.log('>>', req.method(), req.url())

    if (req.url().includes('trustlogo')) {
      logger.debug('>> %s %s', req.method(), req.url())
      //// skip this
      req.respond({
        status: 200,
        body: "skipped loading trustlogo.js"
      })
      // req.abort();
    } else if (req.url().includes("photos")) {
      //// allow images if in /photos directory for OzGunSales
      req.continue();
    } else if (req.url().includes("com_adsmanager")) {
      //// allow images if in /photos directory for UniversalUsedGuns
      req.continue();
    } else if (req.url().includes("usedguns-content")) {
      //// allow images if in /photos directory for Usedguns
      req.continue();
    } else if (req.resourceType() === 'image') {
      //// skip this
      req.respond({
        status: 200,
        body: "skipped loading image"
      })
      // req.abort();
    } else {
      req.continue();
    }
    // if (skipImageLoading){
    // } else {
    //   req.continue();
    // }
	})
  // make functions in node context available to headless browser context
  // REMEMBER these functions must be used with await....
  // because these functions are passed from node context to headless browser context,
  // which is async!!
  await page.exposeFunction("parseGunInfo", parseGunInfo);
  await page.exposeFunction("createInfoDict", createInfoDict);
  await page.exposeFunction("findImageMimeType", findImageMimeType);
  await page.exposeFunction("matchLocationToState", matchLocationToState);
  // then you can use these functions like this inside page.evaluate:
  // let state = await window.matchLocationToState(location)

	return {
		page: page,
		browser: browser,
	}
}

declare global {
  interface Window {
    parseGunInfo(s: string): any
    createInfoDict(): ScrapedInfoDetails
    findImageMimeType(s: string): string
    matchLocationToState(s: string): string
  }
}



export interface ScrapedInfoDetails {
  caliber?: string | null
  make?: string | null
  model?: string | null
  price?: string | null
  advertised?: string | null
  priceInCents?: number // parsed price
  advertisedDate?: Date // parsed date
  action?: string | null
  condition?: string | null
  serialNo?: string | null
  phone?: string | null
  licenseNumber?: string | null
  transferringDealer?: string | null
  comment?: string | null
  adType?: string | null
  state?: string | null
  isSold?: string | null
  soldText?: string | null
  [key: string]: any
}

export const parseGunInfo = (
  textContent: string
): { key: string, value: any } => {

  let s = textContent
  let [key, value] = s.split(":").map(s => s.trim())

  if (key.match(/calib/i)) {
    return { key: "caliber", value }
  } else if (key.match(/make/i)) {
    return { key: "make", value }
  } else if (key.match(/mod[ea]l/i)) {
    return { key: "model", value }
  } else if (key.match(/condition/i)) {
    return { key: "condition", value }
  } else if (key.match(/price/i)) {
    return { key: "price", value }
  } else if (key.match(/advertised/i)) {
    return { key: "advertised", value }
  } else if (key.match(/date\s*listed/i)) {
    return { key: "advertised", value }
  } else if (key.match(/comment/i)) {
    return { key: "comment", value }
  } else if (key.match(/description/i)) {
    return { key: "comment", value }
  } else if (key.match(/action/i)) {
    return { key: "action", value }
  } else if (key.match(/serial/i)) {
    return { key: "serialNo", value }
  } else if (key.match(/phone/i)) {
    return { key: "phone", value }
  } else if (key.match(/licen[cs]e/i)) {
    return { key: "licenseNumber", value }
  } else if (key.match(/transfer/i)) {
    return { key: "transferringDealer", value }
  } else if (key.match(/dealer/i)) {
    return { key: "transferringDealer", value }
  } else if (key.match(/adType/i)) {
    return { key: "adType", value }
  } else if (key.match(/state/i)) {
    return { key: "state", value }
  } else if (key.match(/location/i)) {
    return { key: "state", value }
  } else if (key.match(/soldText/i)) {
    return { key: "soldText", value }
  } else if (key.match(/sold/i)) {
    return { key: "isSold", value }
  } else if (key.match(/barrel/i)) {
    return { key: "barrelLength", value }
  } else if (key.match(/choke/i)) {
    return { key: "choke", value }
  } else {
    return { key, value }
  }
}

export const createInfoDict = (): ScrapedInfoDetails => {
  return {
    caliber: null,
    make: null,
    model: null,
    condition: null,
    price: null,
    priceInCents: null,
    advertised: null,
    advertisedDate: null,
    comment: null,
    action: null,
    serialNo: null,
    phone: null,
    licenseNumber: null,
    transferringDealer: null,
    adType: null,
    state: null,
    isSold: null,
    barrelLength: null,
    // misc
  }
}


export const findImageMimeType = (imgType?: string) => {
  if (!imgType) {
    return 'image/jpeg'
  }
  if (imgType.match(/[jJ][pP][eE]?[gG]/g)) {
    return 'image/jpeg'
  } else if (imgType.match(/[pP][nN][gG]/g)) {
    return 'image/png'
  } else if (imgType.match(/[sS][vV][gG]/g)) {
    return 'image/svg+xml'
  } else if (imgType.match(/[bB][mM][pP]/g)) {
    return 'image/bmp'
  } else {
    return 'image/jpeg'
  }
}


export const matchLocationToState = (l: string) => {
  if (!l) {
    return ""
  }
  if (
    l.match(/QLD/g) ||
    l.match(/[qQ][uU][eE][eE][nN][sS][lL][aA][nN][dD]/g)
  ) {
    return "QLD"
  }
  if (
    l.match(/NSW/g) ||
    l.match(/[nN][eE][wW]\s*[sS][oO][uU][tT][hH]/g)
  ) {
    return "NSW"
  }
  if (
    l.match(/ACT/g) ||
    l.match(/[cC][aA][pP][iI][tT][aA][lL]/g)
  ) {
    return "ACT"
  }
  if (
    l.match(/VIC/g) ||
    l.match(/[vV][iI][cC][tT][oO][rR][iI][aA]/g)
  ) {
    return "VIC"
  }
  if (
    l.match(/TAS/g) ||
    l.match(/[Tt][aA][sS][mM][aA][nN][iI][aA]/g)
  ) {
    return "TAS"
  }
  if (
    l.match(/SA/g) ||
    l.match(/[sS][oO][uU][tT][hH]\s*[aA][uU][sS][tT][rR][aA][lL][iI][aA]/g)
  ) {
    return "SA"
  }
  if (
    l.match(/NT/g) ||
    l.match(/[nN][oO][rR][tT][hH][eE][rR][nN]/g)
  ) {
    return "NT"
  }
  if (
    l.match(/WA/g) ||
    l.match(/[wW][eE][sS][tT][eE][rR][nN]/g)
  ) {
    return "WA"
  }
  return ""
}






