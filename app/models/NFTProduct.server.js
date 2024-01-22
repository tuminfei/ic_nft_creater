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
