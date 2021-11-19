import {
  ScrapedInfoDetails,
} from "~/puppet";
import { External_Products } from "~/typings";


export interface ParsedData {
  postId?: string, // usedguns
  route?: string, // universal-ug, ozgunsales,
  listingId: string,
  link: string,
  adType: string,
  img: {
    url: string,
    width: string,
    height: string,
  }
  info: ScrapedInfoDetails
  priceChanged?: boolean
  imgChanged?: boolean
  priceWas?: number
}

export const intToAlphabet = (i: number) => {
  switch (i) {
    case 0: {
      return ""
    }
    case 1: {
      return "a"
    }
    case 2: {
      return "b"
    }
    case 3: {
      return "c"
    }
    case 4: {
      return "d"
    }
    case 5: {
      return "e"
    }
    case 6: {
      return "f"
    }
    case 7: {
      return "g"
    }
    case 8: {
      return "h"
    }
    case 9: {
      return "i"
    }
    case 10: {
      return "j"
    }
    case 11: {
      return "k"
    }
    case 12: {
      return "l"
    }
    case 13: {
      return "m"
    }
    case 14: {
      return "n"
    }
    case 15: {
      return "o"
    }
    case 16: {
      return "p"
    }
    case 17: {
      return "q"
    }
    case 18: {
      return "r"
    }
    case 19: {
      return "s"
    }
    case 20: {
      return "t"
    }
    case 21: {
      return "u"
    }
    case 22: {
      return "v"
    }
    case 23: {
      return "w"
    }
    case 24: {
      return "x"
    }
    case 25: {
      return "y"
    }
    case 26: {
      return "z"
    }
    default: {
      return ""
    }
  }
}



export const parsePriceString = (price: string) => {

  if (!price) {
    // null, undefined, ""
    return undefined
  }

  let [dollarsStr, centsStr] = price
    ?  price.replace(/[$]/g, '').split('.')
    : ["0", "0"]

  // remove commas betfore parsing as int
  let dollarsInCents = parseInt(dollarsStr.replace(/,/g, '')) * 100
  let cents = parseInt(centsStr)

  let priceInCents = cents
    ? dollarsInCents + cents ?? 0
    : dollarsInCents

  return {
    priceInCents: priceInCents,
  }
}

// make a forEach loop synchronously loop through a bunch of async calls
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


export const filterNewItemsToScrape = (
  items: ParsedData[],
  productsAlreadyScraped: External_Products[]
): ParsedData[] => {

  let newItemsToScrape: ParsedData[] = items
    .map(item => {

      let matchProduct = productsAlreadyScraped
        .find(p => p.sourceSiteId === item.listingId)

      let matchProductPriceExists =
        !!matchProduct?.currentExternalProductSnapshot?.price

      let priceWas = matchProduct?.currentExternalProductSnapshot?.price
        ?? matchProduct?.currentExternalProductSnapshot?.priceWas

      let priceChanged =
        item?.info?.priceInCents !== null &&
        item?.info?.priceInCents !== undefined &&
        matchProductPriceExists &&
        item?.info?.priceInCents !== matchProduct?.currentExternalProductSnapshot?.price

      let existingPreviewItems = matchProduct?.currentExternalProductSnapshot?.previewItems

      let isUsedGunsImagePlaceholder = item?.img?.url?.match('imagenot')
      let isUsedGunsLookingForImage = item?.img?.url?.match('lookingfor')
        ?? item?.img?.url?.match('looking-2')
        ?? item?.img?.url?.match('looking-')


      let imgChanged = existingPreviewItems?.length === 0
        && !!item?.img?.url
        && !isUsedGunsImagePlaceholder
        && !isUsedGunsLookingForImage

      if (imgChanged) {
        console.log("item postId: ", item)
        console.log("newImage: ", item?.img?.url)
      }

      if (priceChanged) {
        console.log("price: ", matchProduct?.currentExternalProductSnapshot?.price)
        console.log("priceInCents: ", item?.info?.priceInCents)
      }

      return {
        ...item,
        priceChanged: priceChanged,
        imgChanged: imgChanged,
        priceWas: priceWas,
      }
    })
    .filter(item => {

      let matchProduct = productsAlreadyScraped.find(p => p.sourceSiteId === item.listingId)

      if (!matchProduct) {
        // rescrape newItems that aren't already scraped
        return true
      } else if (item.priceChanged) {
        // rescrape newItems where price has changed
        return true
      } else if (item.imgChanged) {
        // rescrape newsItems which now have an image (previously missing)
        return true
      } else {
        // filter out the rest of the items. no need to rescrape
        return false
      }
    })

  return newItemsToScrape
}