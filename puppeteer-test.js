
// import { Page, Browser } from "puppeteer";
// let browser: Browser
// let page: Page

let puppeteer = require('puppeteer')
let initBrowser = async () => {
	browser = await puppeteer.launch({ headless: false, args: [ '--no-sandbox' ] })
	page = await browser.newPage()
  await page.on('console', msg => console.log(msg.text()))
  await page.on('error', err => console.log(err))
	await page.setRequestInterception(true);
	// await page.on('request', (req) => {
  //   // console.log('>>', req.method(), req.url())
	// 	if (req.resourceType() === 'image') {
	// 		req.respond({
	// 			status: 200,
	// 			body: "skipped loading image"
	// 		})
	// 		// req.abort();
	// 	} else {
	// 		req.continue();
	// 	}
	// })

	const userAgents = [
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	]
	getRandomInt = (max) => {
		return Math.floor(Math.random() * max)
	}
	randomUserAgent = userAgents[getRandomInt(userAgents.length)]
	await page.setUserAgent(randomUserAgent)
	return browser
}

browser = initBrowser()
// url = 'https://usedguns.com.au/whats-new/'
// url = 'https://www.ozgunsales.com/photos/image13_1630654987.jpg'
// url = 'https://www.ozgunsales.com/photos/image13_1630654987.jpg'

// url = 'https://www.ozgunsales.com/listing/98255/franchi_affinity_12g_semi_auto.html'
url = "https://www.universalusedguns.com.au/component/adsmanager/all_ads"
// url = 'https://www.ozgunsales.com'
// browser.close()
// url = 'https://example.com/'
// cookies = page.cookies()

// p.then(async page => {
// 	await page.goto(url, { timeout: 0 })
// })

p = browser.newPage()
p.then(async page => {
	await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })
	await page.goto(url, { timeout: 0 })
	let handles = await page.$$('a[data-gallery="jquery"]')
	let button = handles[0]
	await page.evaluate(b => b.click(), button)
	await page.waitForSelector('.photoviewer-stage')

	let handles2 = await page.$$('.photoviewer-button-maximize')
	let button2 = handles2[0]
	await page.evaluate(b => b.click(), button2)

	await page.waitForTimeout(2000);
  const gunImg = await page.$('.photoviewer-image');
  await gunImg.screenshot({
    path: 'gunImg.jpg',
		type: 'jpeg',
		quality: 100,
		omitBackground: true,
	});
})















const parseGunInfo = (textContent)=> {

  let s = textContent
  let [key, value] = s.split(":").map(s => s.trim())

  if (key.match(/[Cc]alib/g)) {
    return { key: "caliber", value }
  } else if (key === 'Make') {
    return { key: "make", value }
  } else if (key === 'Model') {
    return { key: "model", value }
  } else if (key === 'Condition') {
    return { key: "condition", value }
  } else if (key === 'Price') {
    return { key: "price", value }
  } else if (key === 'Advertised') {
    return { key: "advertised", value }
  } else if (key === 'Comment') {
    return { key: "comment", value }
  } else if (key === 'Action') {
    return { key: "action", value }
  } else if (key.match(/[Ss]erial/g)) {
    return { key: "serialNo", value }
  } else if (key.match(/[Pp]hone/g)) {
    return { key: "phone", value }
  } else if (key.match(/[lL]icen[cs]e/g)) {
    return { key: "licenseNumber", value }
  } else if (key.match(/[Tt]ransfer/g)) {
    return { key: "transferringDealer", value }
  } else if (key.match(/[aA]dType/g)) {
    return { key: "adType", value }
  } else if (key.match(/[sS]tate/g)) {
    return { key: "state", value }
  } else if (key.match(/[sS][oO][lL][dD]/g)) {
    return { key: "isSold", value: true }
  } else {
    return { key, value }
  }
}

const createInfoDict = () => {
  return {
    caliber: null,
    make: null,
    model: null,
    condition: null,
    price: null,
    advertised: null,
    comment: null,
    action: null,
    serialNo: null,
    phone: null,
    licenseNumber: null,
    transferringDealer: null,
    adType: null,
    state: null,
    isSold: false,
  }
}

// make functions in node context available to headless browser context
page.exposeFunction("parseGunInfo", parseGunInfo);
page.exposeFunction("createInfoDict", createInfoDict);




itemsFuture = page.evaluate(async () => {

	let listings = Object.values(document.body.querySelectorAll('article.gun'))
	console.log("listings: ", JSON.stringify(listings))

	let data = listings.slice(0,20).map(e => {

			try {
				let link = e.querySelector('a.p-1')
				let linkUrl = link.getAttribute('href')
				console.log("linkUrl: ", linkUrl)

				let img = e.querySelector('img')
				let info = e.querySelector("div.pb-2")
				let textContentLines = info.textContent.split("\n")
					.map(s => s.trim())
					.filter(s => !!s)

				console.log("textContentLines: ", JSON.stringify(textContentLines))

				let infoDict = createInfoDict()

				textContentLines.map(s => {
          let { key, value } = parseGunInfo(s)
          infoDict[key] = value
				})

				console.log("infoDict: ", JSON.stringify(infoDict))

				return {
					link: linkUrl,
					img: img ? JSON.stringify({
						url: img.getAttribute('src'),
						width: img.getAttribute('width'),
						height: img.getAttribute('height'),
					}) : {},
					info: JSON.stringify(infoDict),
				}
			} catch(e) {
			}
	})

	// console.log("data: ", JSON.stringify(data))
	return data
})

items = itemsFuture.then(x => items = x)






let infoList = []

(async () => {
	for (let i = 0; i < 5; i++) {

		item = items[i]
		console.log("iteration: ", i)
		console.log("item: ", item)

		if (item.link) {

			let id = item.link.split('/').filter(s => !!s).slice(-1)[0]

			try {
				await page.goto(item.link, {
					waitUntil: 'domcontentloaded',
					// Remove the timeout
					timeout: 1000
				})
				await page.waitForSelector("div.entry-content")

				let textContentLines = await page.evaluate(() => {

					let article = document.body.querySelector("article.gun")
					let infoElems = article.querySelectorAll('div.single_detail > p')

					let info = Object.values(infoElems).map(elem => {
						if (elem && elem.textContent) {
							return elem.textContent
						}
					})
					.map(s => s.trim())
					.filter(s => !!s)
					return info
				})

				let infoDict = createInfoDict()

				textContentLines.map(s => {
          let { key, value } = parseGunInfo(s)
          infoDict[key] = value
				})

				let _adInfo = article.querySelector("div.row.mx-0 > div:nth-child(4)")
				let [adType, state] = _adInfo.textContent.split('\n')
						.map(s => s.trim())
						.filter(s => !!s)


				// console.log('infoDict: ', JSON.stringify(infoDict))
				// let infoDict = "asdfasdf"
				infoList.push({
					id: id,
					link: item.link,
					img: item.img,
					info: item.info,
					details: infoDict,
					adType: adType,
					state: state,
				})
				console.log('infoList: ', infoList)

				await page.waitForTimeout(300);

			} catch(e) {
				console.log('minor error: ', e)
			}

		}
	}
})()





