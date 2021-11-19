
import {
  ExternalProductCreateInput,
  NewsItem,
  External_Products,
} from "~/typings";

import { GraphQLClient, gql } from 'graphql-request'
import { GQL_URL } from ".";
import { login_as_system } from "./user";


export const ExternalProductSnapshotsFragment = gql`
  fragment ExternalProductSnapshotsFragment on external_product_snapshots {
    id
    externalProductId
    createdAt
    caliber
    make
    model
    price
    advertised
    action
    condition
    serialNumber
    phoneNumber
    licenseNumber
    transferringDealer
    description
    adType
    state
    soldText
    isSold
    previewItems {
      id
      imageId
      position
      youTubeEmbedLink
      variantSnapshotId
      image {
        id
        createdAt
        originalVariantId
        tags
        description
        original {
          id
          parentId
          mimeType
          widthInPixels
          heightInPixels
          sizeInBytes
          url
        }
        variants {
          id
          parentId
          mimeType
          widthInPixels
          heightInPixels
          sizeInBytes
          url
        }
      }
    }
  }
`;


export const ExternalProductsFragment = gql`
  fragment ExternalProductsFragment on external_products {
    id
    createdAt
    updatedAt
    sourceSite
    sourceSiteId
    currentExternalProductSnapshotId
    currentExternalProductSnapshot {
      ...ExternalProductSnapshotsFragment
    }
  }
  ${ExternalProductSnapshotsFragment}
`;

export const NewsItemFragment = gql`
  fragment NewsItemFragment on NewsItem {
    id
    createdAt
    updatedAt
    productId
    product {
      id
    }
    externalProductId
    externalProduct {
      ...ExternalProductsFragment
    }
    sourceSite
    isSuspended
  }
  ${ExternalProductsFragment}
`;


export const GET_EXTERNAL_PRODUCTS_BY_SOURCE_SITE_ID = gql`
  query (
    $externalProductIds: [String!]!
    $howManyDaysBack: Int
  ) {
    getExternalProductsBySourceSiteId(
      externalProductIds: $externalProductIds
      howManyDaysBack: $howManyDaysBack
    ) {
      ...ExternalProductsFragment
    }
  }
  ${ExternalProductsFragment}
`;


export const GET_NEWS_ITEM = gql`
  query ($newsItemIds: [String!]!) {
    getNewsItem(
      newsItemIds: $newsItemIds
    ) {
      ...NewsItemFragment
    }
  }
  ${NewsItemFragment}
`;



export const CREATE_NEWS_ITEM = gql`
  mutation createNewsItemWithExternalProduct(
    $externalProductCreateInput: ExternalProductCreateInput
    $rescrape: Boolean
  ) {
    createNewsItemWithExternalProduct(
      externalProductCreateInput: $externalProductCreateInput
      rescrape: $rescrape
    ) {
      ...NewsItemFragment
    }
  }
  ${NewsItemFragment}
`;


export const MARK_EXTERNAL_PRODUCT_AS_SOLD = gql`
  mutation markExternalProductAsSold(
    $sourceSiteId: String!
    $soldText: String!
    $isSold: Boolean!
    $price: Int
    $skipHrsToSold: Boolean
  ) {
    markExternalProductAsSold(
      sourceSiteId: $sourceSiteId
      soldText: $soldText
      isSold: $isSold
      price: $price
      skipHrsToSold: $skipHrsToSold
    ) {
      ...NewsItemFragment
    }
  }
  ${NewsItemFragment}
`;


export const createNewsItemWithExternalProduct = async (
  externalProductCreateInput: ExternalProductCreateInput,
  authCookie: string,
  rescrape: boolean = false,
): Promise<NewsItem> => {

  interface Mvar {
    externalProductCreateInput: ExternalProductCreateInput,
    rescrape: boolean
  }
  interface Mdata {
    createNewsItemWithExternalProduct: NewsItem
  }

  const client = new GraphQLClient(GQL_URL, {
    headers: {
      'cookie': authCookie,
    }
  })

  const variables = {
    externalProductCreateInput: externalProductCreateInput,
    rescrape: rescrape,
  }
  // console.log("\n\n\n\n varialbes to create newsitem", variables)

  const data = await client.request<Mdata, Mvar>(
    CREATE_NEWS_ITEM,
    variables
  );
  const newsItem = data.createNewsItemWithExternalProduct
  return newsItem
}



export const getExternalProductsBySourceSiteId = async(
  externalProductIds: string[],
  authCookie: string,
  howManyDaysBack?: number,
): Promise<External_Products[]> => {

  if (externalProductIds?.length < 1) {
    return []
  }

  interface Qvar {
    externalProductIds: string[]
    howManyDaysBack: number
  }
  interface Qdata {
    getExternalProductsBySourceSiteId: External_Products[]
  }

  const client = new GraphQLClient(GQL_URL, {
    headers: {
      'cookie': authCookie,
    }
  })

  const data = await client.request<Qdata, Qvar>(
    GET_EXTERNAL_PRODUCTS_BY_SOURCE_SITE_ID, {
    externalProductIds: externalProductIds,
    howManyDaysBack: howManyDaysBack ?? 30,
  })
  const result = data.getExternalProductsBySourceSiteId
  return result
}


export const markExternalProductsAsSoldBySourceSiteId = async(
  sourceSiteId: string,
  soldText: string,
  isSold: boolean,
  price: number,
  authCookie: string,
  skipHrsToSold?: boolean,
): Promise<NewsItem> => {

  interface Qvar {
    sourceSiteId: string
    soldText: string
    isSold: boolean
    price: number
    skipHrsToSold?: boolean
  }
  interface Qdata {
    markExternalProductAsSold: NewsItem
  }

  const client = new GraphQLClient(GQL_URL, {
    headers: {
      'cookie': authCookie,
    }
  })

  const data = await client.request<Qdata, Qvar>(
    MARK_EXTERNAL_PRODUCT_AS_SOLD, {
    sourceSiteId: sourceSiteId,
    soldText: soldText,
    isSold: isSold,
    price: price,
    skipHrsToSold: skipHrsToSold,
  })
  const result = data.markExternalProductAsSold
  return result
}
