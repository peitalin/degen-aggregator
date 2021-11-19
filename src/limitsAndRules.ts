/// Limits that users may or may not bump into:

export const minPrice = 100;
export const promoCodeMaxLength = 20;
export const promoCodeMinLength = 3;
export const minLengthStoreName = 3;
export const maxLengthStoreName = 60;
export const minLengthStoreBio = 1;
export const maxLengthStoreBio = 200;
export const minStockQuantity = 0;
export const minLengthVariantName = 1;
export const maxLengthVariantName = 250;
export const minLengthVariantDescription = 1;
export const maxLengthVariantDescription = 250;
export const maxCountVariants = 2;
export const minCountFiles = 1;
export const maxCountFiles = 20;
export const minCountPreviews = 1;
export const maxCountPreviews = 10;
export const minCountTags = 0;
export const maxCountTags = 10;
export const minLengthTag = 1;
export const maxLengthTag = 50;
export const minLengthProductName = 1;
export const maxLengthProductName = 50;
export const minLengthProductTagline = 1;
export const maxLengthProductTagline = 60;
export const minLengthProductDescription = 1;
export const maxLengthProductDescription = 2000;
export const maxItemsPerOrder = 30;
export const maxPromoCodesPerOrder = 1;
export const maxCountCuratedListItems = 30;
export const maxStockQuantity = 100;
export const minSpecialDealDiscountPercent = 0.1;
export const maxSizePerFile = 5000 * 1000 * 1000; // 5000 MB
export const maxImageFileSize = 20 * 1000 * 1000; // 20 MB
export const maxPaymentMethods = 10;

/// Unlikely limits (just here to keep the system bounded):

export const maxProductsPerStore = 1000;
export const idMaxLength = 250;
export const promoCodesMaxBulkAdd = 1; //50;
export const searchTermMaxLength = 1000;
export const websiteMaxLength = 2000;
export const maxPrice = 999999; // $10k
export const minCountVariants = 1;
export const maxLengthListName = 250;

/// ID prefixes:

export const userIdPrefix = "user_";
export const productIdPrefix = "prod_";
export const productSnapshotIdPrefix = "prodsnapshot_";
export const productVariantIdPrefix = "prodvariant_";
export const productVariantSnapshotIdPrefix = "prodvariantsnapshot_";
export const previewItemIdPrefix = "preview_item_";
export const storeIdPrefix = "store_";
export const imageIdPrefix = "image_";
export const fileIdPrefix = "product_file_";
export const emailIdPrefix = "email_";

// ID prefix regexes:

export const userIdRegex = new RegExp(`^${userIdPrefix}`);
export const productIdRegex = new RegExp(`^${productIdPrefix}`);
export const productSnapshotIdRegex = new RegExp(`^${productSnapshotIdPrefix}`);
export const productVariantIdRegex = new RegExp(`^${productVariantIdPrefix}`);
export const productVariantSnapshotIdRegex = new RegExp(
  `^${productVariantSnapshotIdPrefix}`
);
export const previewItemIdRegex = new RegExp(`^${previewItemIdPrefix}`);
export const storeIdRegex = new RegExp(`^${storeIdPrefix}`);
export const imageIdRegex = new RegExp(`^${imageIdPrefix}`);
export const fileIdRegex = new RegExp(`^${fileIdPrefix}`);
export const emailIdRegex = new RegExp(`^${emailIdPrefix}`);