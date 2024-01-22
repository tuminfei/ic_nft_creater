import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Card, Page, List } from "@shopify/polaris";

import db from "../db.server";
import { getProducts } from "../models/NFTProduct.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  console.log("111111");
  const products = await getProducts(session.shop, admin.graphql);
  console.log(products);
  return json({
    products,
  });
}

export default function Products() {
  const products = useLoaderData();
  console.log(products, "products");
  return (
    <Page>
      <Card>
        <List type="bullet" gap="loose"></List>
      </Card>
    </Page>
  );
}
