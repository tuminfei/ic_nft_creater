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

export async function createProduct(shop, title, price, graphql) {
  const response = await graphql(
    `
      #graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
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
        },
      },
    }
  );
  return response;
}
