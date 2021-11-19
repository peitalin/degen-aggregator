

import { discordServerAlerts } from "~/utils/discord";

import * as puppeteer from "puppeteer";

import { pipeline } from "stream";
import { promisify } from "util"
import {
  login_as_system,
  get_user_profile,
  UserPublic,
} from "~/requests/user"
import {
  createNewsItemWithExternalProduct,
  getExternalProductsBySourceSiteId,
} from "~/requests/newsItems";
import {
  findImageMimeType,
  parseGunInfo,
  createInfoDict,
  ScrapedInfoDetails,
} from "~/puppet";

// import {
//   scrapeUsedGunsProductPage,
//   UsedGunsProductPageResult,
// } from "./usedguns-productpage";
import {
  parsePriceString,
  filterNewItemsToScrape,
  ParsedData,
} from "../helpers";




interface UsedGunsRawData {
  textContentLines: string[],
  postId: string,
  link: string,
  adType: string,
  img: {
    url: string,
    width: string,
    height: string,
  }
}
interface UsedGunsParsedData extends ParsedData {}
// interface UsedGunsParsedData {
//   postId: string,
//   listingId: string,
//   link: string,
//   adType: string,
//   img: {
//     url: string,
//     width: string,
//     height: string,
//   }
//   info: ScrapedInfoDetails
//   priceChanged?: boolean
//   imgChanged?: boolean
//   priceWas?: number
// }




export const scrapeUsedGunsFrontPage = async (page: puppeteer.Page) => {

  let url = 'https://usedguns.com.au/whats-new/'
  await page.goto(url);
  await page.waitForSelector("div.entry-content")
  await page.waitForSelector('a.p-1.usedguns__sellerbadge');

  ///////////////// PAGE EVALUATE //////////////////
  let rawData: UsedGunsRawData[] = await page.evaluate(async () => {

    let doc = document.querySelector('article > div.entry-content')

    let listings =
      (doc.querySelectorAll('article.wrapperListing')?.length > 0)
      ? Object.values(doc.querySelectorAll('article.wrapperListing'))
      : (doc.querySelectorAll('article.gun')?.length > 0)
        ? Object.values(doc.querySelectorAll('article > div.entry-content.p-3'))
        : Object.values(doc.querySelectorAll('article.gun'))

    let rawData = []

    /// use loops inside of map() to get order correct when items are async
    for (let i = 0; i < listings.length; i++) {

      // element
      let e = listings[i]

      let link = e?.querySelector('a.p-1')
      // 'https://usedguns.com.au/gun/391906/'
      let postId = link?.getAttribute('href')?.split('/')?.filter(s => !!s)?.slice(-1)?.[0]

      if (!postId) {
        // sold listings have no links, no postId
        continue
      }

      let linkUrl = link?.getAttribute('href')
        ? link?.getAttribute('href')
        : `https://usedguns.com.au/gun/${postId}/`

      let img = null
      try {
        img = e?.querySelector('img')
      } catch (e) {
      }

      let info = e.querySelector("div.single_detail")

      let textContentLines = (info?.textContent?.split("\n") ?? [])
        .map(s => s.trim())
        .filter(s => !!s)

      let _adInfo = e?.querySelector('p.mt-1')
      if (!_adInfo) {
        _adInfo = e.querySelector('div.usedguns__singleblockWrapper > div:nth-child(2)')
      }

      let [adType, state] = (_adInfo?.textContent?.split('\n') ?? [])
          .map(s => s.trim())
          .filter(s => !!s)

      textContentLines = [
        ...textContentLines,
        `adType: ${adType}`,
        `${state}`, // state = "State: NSW" format already
      ]

      console.log("\npostId: ", postId)
      console.log("linkUrl: ", linkUrl)
      // console.log("textContentLines: ", JSON.stringify(textContentLines))

      rawData.push({
        textContentLines: textContentLines,
        postId: postId,
        link: linkUrl,
        adType: adType,
        img: img
          ? {
              url: img.getAttribute('src'),
              width: img.getAttribute('width'),
              height: img.getAttribute('height'),
            }
          : {},
      })
    }

    return rawData
  })
  ///////////////// PAGE EVALUATE //////////////////

  let items: UsedGunsParsedData[] = []
  // scrape oldest items first
  rawData = rawData.reverse()

  for (let i = 0; i < rawData.length; i++) {

    // 1. parse infoDict from raw textContentLines
    let data = rawData[i];
    let infoDict: ScrapedInfoDetails = await createInfoDict()
    let textContentLines = data?.textContentLines

    for (let j = 0; j < textContentLines.length; j++) {
      let s = textContentLines[j]
      let { key, value } = await parseGunInfo(s)
      infoDict[key] = value
    }

    let price = parsePriceString(infoDict?.price)
    infoDict.priceInCents = price?.priceInCents
    // console.log("infoDict: ", JSON.stringify(infoDict))

    // 2. push this into items array
    items.push({
      postId: data?.postId,
      listingId: data?.postId,
      link: data?.link,
      adType: data?.adType,
      img: data?.img,
      info: infoDict,

    })

  }

  return items
}



