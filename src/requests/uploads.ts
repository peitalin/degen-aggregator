
import {
  Image_Parents,
  UploadType,
} from "~/typings";
import { GraphQLClient, gql } from 'graphql-request'
import {
  GQL_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  imagesBucket,
} from "."






export const GET_IMAGES = gql`
  query getImages(
    $imageIds: [String!]!
  ) {
    getImages(
      imageIds: $imageIds
    ) {
      id
      original {
        id
        mimeType
        heightInPixels
        widthInPixels
        sizeInBytes
        url
      }
      variants {
        id
        mimeType
        sizeInBytes
        widthInPixels
        heightInPixels
        url
      }
      createdAt
      tags
      description
    }
  }
`;

export const UPLOAD_STEP1_REGISTER_GOOGLE_URL = gql`
  mutation uploadRegisterGoogleUrl(
    $uploadType: UploadType!
    $mimeType: String!
    $fileSize: Int!
  ) {
    uploadRegisterGoogleUrl(
      uploadType: $uploadType
      mimeType: $mimeType
      fileSize: $fileSize
    ) {
      ... on UploadRegisterMutationResponse {
        uploadId
        putUrl
      }
    }
  }
`;

export const UPLOAD_SAVE_IMAGE = gql`
  mutation uploadSaveImage(
    $uploadId: String!
    $description: String
    $tags: String
    $ownerIds: [String]
    $rescrape: Boolean
    $isInternal: Boolean
  ) {
    uploadSaveImage(
      uploadId: $uploadId
      description: $description
      tags: $tags
      ownerIds: $ownerIds
      isInternal: $isInternal
      rescrape: $rescrape
    ) {
      ... on UploadSaveImageMutationResponse {
        image {
          id
          original {
            id
            mimeType
            heightInPixels
            widthInPixels
            sizeInBytes
            url
          }
          variants {
            id
            mimeType
            sizeInBytes
            widthInPixels
            heightInPixels
            url
          }
          createdAt
          tags
          description
        }
      }
    }
  }
`;




// uploadType: "IMAGE", // "PRODUCT_FILE"
// mimeType: "image/jpeg",
// fileSize: 12391823
// 1
export const google_storage_register = async (
  authCookie: string,
  mimeType: string, // only for frontend
  fileSize: number, // only for frontend
): Promise<GSRegisterResponse> => {

  interface Mvar {
    uploadType: UploadType;
    mimeType: string;
    fileSize: number;
  }
  interface Mdata {
    uploadRegisterGoogleUrl: {
      uploadId: string,
      putUrl: string
    }
  }

  const client = new GraphQLClient(GQL_URL, {
    headers: {
      'cookie': authCookie,
    }
  })

  const data = await client.request<Mdata, Mvar>(
    UPLOAD_STEP1_REGISTER_GOOGLE_URL, {
    uploadType: UploadType.IMAGE,
    mimeType: mimeType,
    fileSize: fileSize
  });
  const result = data.uploadRegisterGoogleUrl
  return {
    uploadId: result.uploadId,
    uploadUrl: result.putUrl
  }
}

interface GSRegisterResponse {
  uploadId: string;
  uploadUrl: string;
}

// 2 (image)
export const google_storage_save_image_to_db = async({
  authCookie,
  uploadId,
  description,
  tags,
  ownerIds,
  rescrape,
}: {
  authCookie: string,
  uploadId: string,
  description?: string,
  tags?: string,
  ownerIds?: string[],
  rescrape?: boolean,
}): Promise<Image_Parents> => {

  interface Mvar {
    uploadId: string;
    description?: string;
    tags?: string;
    ownerIds?: string[]
    isInternal: boolean
    rescrape?: boolean
  }
  interface Mdata {
    uploadSaveImage: {
      image: Image_Parents
    }
  }

  const client = new GraphQLClient(GQL_URL, {
    headers: {
      'cookie': authCookie,
    }
  })

  const data = await client.request<Mdata, Mvar>(
    UPLOAD_SAVE_IMAGE, {
    uploadId: uploadId,
    description: description,
    tags: tags,
    ownerIds: ownerIds,
    isInternal: false, // aggregator is external
    rescrape: rescrape,
  })
  const result = data.uploadSaveImage;
  return result.image
}


export const get_images_from_gateway = async(
  authCookie: string,
  imageIds: string[],
): Promise<Image_Parents[]> => {

  if (imageIds?.length < 1) {
    return []
  }

  interface Mvar {
    imageIds: string[];
  }
  interface Mdata {
    getImages: Image_Parents[]
  }

  const client = new GraphQLClient(GQL_URL, {
    headers: {
      'cookie': authCookie,
    }
  })

  const data = await client.request<Mdata, Mvar>(
    GET_IMAGES, {
    imageIds: imageIds,
  })
  const result = data.getImages;
  return result
}


