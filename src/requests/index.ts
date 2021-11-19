
import { Storage, GetSignedUrlConfig, Bucket } from "@google-cloud/storage";
require("dotenv").config();

const IMAGES_BUCKET: string = process.env.IMAGES_BUCKET ?? "production-gunmarketplace-images"
// if (!_imagesBucketName) {
//   throw new Error("IMAGES_BUCKET env variable is undefined!");
// }
export const imagesBucket: Bucket = new Storage({
  keyFilename: './keys/google_upload_key.json'
}).bucket(IMAGES_BUCKET);

// see .env
export const GQL_URL = process.env.GQL_URL
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD


