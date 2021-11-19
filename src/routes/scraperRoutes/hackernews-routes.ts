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
      // executablePath: '/usr/bin/chromium',
      executablePath: 'google-chrome-stable',
      args: [
        '--no-sandbox',
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        '--single-process',
      ],
    });

    const page = await browser.newPage()
    console.log("page: ", page)
    let url = 'https://news.ycombinator.com/news'
    await page.goto(url);

    browser.close()


    res.send(`
    <div style="margin: 2rem">
      <h2>Hacker News Aggregator</h2>
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
