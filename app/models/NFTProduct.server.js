import invariant from "tiny-invariant";
import db from "../db.server";
const fs = require("fs");

export async function getProducts(shop, graphql) {
  const query = `
  {
    products(first: 20, query: "vendor:'IC NFT Creator'") {
      edges {
        node {
          id
          handle
          title
          description
          featuredImage {
            url
            altText
          }
          productType
          status
          vendor
          onlineStorePreviewUrl
          options(first: 2) {
            id
            name
            position
            values
          }
          createdAt
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
  `;

  const response = await graphql(query);
  if (response.ok) {
    const data = await response.json();

    const {
      data: {
        products: { edges },
      },
    } = data;

    return edges;
  } else {
    return null;
  }
}

export async function createProduct(
  shop,
  graphql,
  title,
  price,
  image_src,
  canister_id,
  token_id
) {
  const response = await graphql(
    `
      #graphql
      mutation populateProduct(
        $input: ProductInput!
        $media: [CreateMediaInput!]
      ) {
        productCreate(input: $input, media: $media) {
          product {
            id
            title
            handle
            status
            media(first: 10) {
              nodes {
                alt
                mediaContentType
                preview {
                  status
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        input: {
          title: title,
          variants: [{ price }],
          customProductType: "IC NFT",
          vendor: "IC NFT Creator",
          metafields: [
            {
              namespace: "nft_info",
              key: "canister_id",
              type: "single_line_text_field",
              value: canister_id,
            },
            {
              namespace: "nft_info",
              key: "token_id",
              type: "single_line_text_field",
              value: token_id,
            },
          ],
        },
        media: [
          {
            originalSource: encodeURI(image_src),
            alt: title + " NFT Image",
            mediaContentType: "IMAGE",
          },
        ],
      },
    }
  );
  return response;
}

export async function createProductImage(
  admin,
  session,
  product_id,
  file_name,
  file_data
) {
  const image_rest = new admin.rest.resources.Image({ session: session });
  // const image_url = "public/nft/logo.png";
  // const image_buff = fs.readFileSync(image_url, { encoding: "base64" });
  // console.log(image_buff);
  image_rest.product_id = product_id;
  image_rest.position = 1;
  image_rest.metafields = [
    {
      key: "new",
      value: "newvalue",
      type: "single_line_text_field",
      namespace: "global",
    },
  ];
  image_rest.attachment = file_data;
  image_rest.filename = file_name;
  return image_rest;
}
