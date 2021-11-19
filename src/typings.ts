export type ID = string;

export interface Email {
  id: ID;
  createdAt: Date;
  from: string;
  to: string;
  subject: string;
  emailType: string;
}

export interface UserPublic {
  firstName?: string;
  lastName?: string;
  email: string;
}

/** A category of file upload – each one has a different purpose. */
export enum UploadType {
  IMAGE = 'IMAGE',
  PRODUCT_FILE = 'PRODUCT_FILE'
}

/** columns and relationships of "image_parents" */
export type Image_Parents = {
   __typename?: 'image_parents',
  createdAt: Date,
  description?: string,
  id: string,
  original?: Image_Variants,
  originalVariantId: string,
  tags?: string,
  isInternal?: boolean,
  /** An array relationship */
  variants: Array<Image_Variants>,
  /** An aggregate relationship */
  // variants_aggregate: Image_Variants_Aggregate,
};

/** columns and relationships of "image_variants" */
export type Image_Variants = {
   __typename?: 'image_variants',
  heightInPixels: number,
  id: string,
  mimeType: string,
  parentId: string,
  sizeInBytes: number,
  url?: string,
  widthInPixels: number,
};

export type LoginMutationResponse = {
   __typename?: 'LoginMutationResponse',
  user: UserPublic,
  jwt?: string,
  setCookie: string,
  authCookie: string, // `gun-auth=${setCookie}`
};

export type ExternalProductCreateInput = {
  action: string,
  adType: string,
  advertised: Date,
  caliber: string,
  description: string,
  isSold: boolean,
  licenseNumber: string,
  make: string,
  model: string,
  phoneNumber: string,
  price: number,
  priceWas?: number,
  condition: string,
  serialNumber: string,
  soldText: string,
  state: string,
  transferringDealer: string,
  title: string,
  sourceSite: string,
  sourceSiteId: string,
  previewItems: Array<ProductPreviewItemInput>,
};

export type ProductPreviewItemInput = {
  imageId: string,
  youTubeEmbedLink?: String,
  isInternal: boolean
};

export type NewsItem = {
  id: string,
  createdAt: Date,
  updatedAt: Date,
  externalProductId?: string,
  externalProduct?: any,
  productId?: string,
  product?: any,
  isDeleted: boolean,
  isSuspended: boolean,
  sourceSite: string,
  score?: number,
};

/** columns and relationships of "external_products" */
export type External_Products = {
  id: string,
  createdAt: Date,
  updatedAt: Date,
  currentExternalProductSnapshot?: External_Product_Snapshots,
  currentExternalProductSnapshotId: string,
  externalProductSnapshots: any[],
  sourceSite: string,
  sourceSiteId?: string,
  sourceSiteUrl?: string,
};

export type External_Product_Snapshots = {
   __typename?: 'external_product_snapshots',
  action?: string,
  adType?: string,
  advertised?: Date,
  barrelLength?: string,
  caliber?: string,
  condition?: string,
  createdAt: Date,
  description?: string,
  externalProductId: string,
  id: string
  isSold?: boolean,
  licenseNumber: string
  make?: string,
  model?: string,
  phoneNumber?: string,
  /** An array relationship */
  previewItems: Array<Product_Preview_Items>,
  /** An aggregate relationship */
  // previewItems_aggregate: Product_Preview_Items_Aggregate,
  price?: number,
  priceWas?: number,
  serialNumber: string
  soldText?: string,
  state?: string,
  title?: string,
  transferringDealer?: string,
};

export type Product_Preview_Items = {
   __typename?: 'product_preview_items',
  id: string,
  image?: Image_Parents,
  imageId?: string,
  position: number,
  variantSnapshotId?: string,
  youTubeEmbedLink?: string,
};
