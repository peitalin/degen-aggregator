import { ID } from "../../typings";
import {
  Route,
  Validatable,
  Empty,
  HttpMethod,
} from "~/routeTypings";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import {
  initPuppetBrowser,
} from "~/puppet";
import { RoutePaths } from "."


import * as puppeteer from "puppeteer";


const frontPageHackerNewsRoute: Route<Empty, Empty, Empty> = {
  path: RoutePaths.frontPageHackerNews,
  method: HttpMethod.GET,
  paramsType: Empty,
  queryType: Empty,
  bodyType: Empty,
  handler: async (req, res, next, params, query, body) => {

    // let { page, browser } = await initPuppetBrowser()
    const browser = await puppeteer.launch({
      headless: true,
      // headless: false, // only on desktop/local
      executablePath: '/usr/bin/chromium',
      // executablePath: 'google-chrome-stable',
      args: [
        '--no-sandbox',
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        '--single-process',
        '--no-zygote',
      ],
    });

    const page = await browser.newPage()
    console.log("page: ", page)
    let url = 'https://news.ycombinator.com/news'
    await page.goto(url);
    await page.waitForSelector("tbody")

    interface LinkHN {
      title: string
      url: string
    }

    let titles = await page.evaluate(async () => {

      let elems = document.querySelectorAll('td.title > a')
      let titlesRaw: LinkHN[] = []

      elems.forEach(l => {
        //@ts-ignore
        let title = l?.innerText
        //@ts-ignore
        let url = l?.href

        titlesRaw.push({
          title: title,
          url: url,
        } as LinkHN)
      })

      return titlesRaw
    })

    let html = titles.map(t => {
      return `<p><a href=${t.url}>${t.title}</a></p>`
    }).join('\n')

    browser.close()


    res.send(`
    <div style="margin: 2rem">
      <h2>Hacker News Aggregator</h2>
      ${html}
    </div>
    `)
  }
};


export class ProductPageHackerNewsParams implements Validatable {

  @IsString()
  listingId: ID;

  constructor(input: any) {
    this.listingId = input.listingId;
  }
}

export class ProductPageHackerNewsQuery implements Validatable {

  @IsString()
  @IsOptional()
  rescrape: string;

  @IsString()
  @IsOptional()
  json: string;

  constructor(input: any) {
    this.rescrape = input.rescrape;
    this.json = input.json;
  }
}




const HackerNewsRoutes: Route<any, any, any>[] = [
  frontPageHackerNewsRoute,
];
export default HackerNewsRoutes;
