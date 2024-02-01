import invariant from "tiny-invariant";
import db from "../db.server";

export async function getProducts(shop, graphql) {
  const query = `
  {
    products(first: 10) {
      edges {
        node {
          id
          handle
          title
          description
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
