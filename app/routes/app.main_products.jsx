import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Card, Page, List } from "@shopify/polaris";

import db from "../db.server";
import { getProducts } from "../models/NFTProduct.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const products = await getProducts(session.shop, admin.graphql);
  console.log(products);
  return json({
    products,
  });
}

const NFTProductTable = ({ nft_products }) => (
  <IndexTable
    resourceName={{
      singular: "NFT Product Info",
      plural: "NFT Product Infos",
    }}
    itemCount={nft_products.length}
    headings={[
      { title: "Index", hidden: true },
      { title: "Name" },
      { title: "Token Id" },
      { title: "Collection Name" },
      { title: "Image" },
      { title: "Owner" },
      { title: "Product" },
      { title: "Onchain" },
      { title: "Date created" },
    ]}
    selectable={false}
  >
    {nft_products.map((nft_product) => (
      <NFTTableRow key={nft_product.id} nft_product={nft_product} />
    ))}
  </IndexTable>
);

const NFTTableRow = ({ nft_product }) => (
  <IndexTable.Row id={nft_product.id} position={nft_product.id}>
    <IndexTable.Cell>
      <Text variant="bodyMd" fontWeight="bold" as="span">
        # {nft_product.id}
      </Text>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <Link to={`../nft_infos/${nft_product.id}`}>{truncate(nft_product.name)}</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_product.token_id}</IndexTable.Cell>
    <IndexTable.Cell>{nft_product.nft_collection.name}</IndexTable.Cell>
    <IndexTable.Cell>
      <Thumbnail
        source={"data:image/png;base64, " + nft_product.image_data || ImageIcon}
        alt={nft_product.name}
        size="small"
      />
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_product.owner}</IndexTable.Cell>
    <IndexTable.Cell>{nft_product.product_id}</IndexTable.Cell>
    <IndexTable.Cell>
      {nft_product.onchain === true ? (
        <Badge tone="success">OnChain</Badge>
      ) : (
        <Badge tone="warning">OffChain</Badge>
      )}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(nft_product.createdAt).toDateString()}
    </IndexTable.Cell>
  </IndexTable.Row>
);
export default function Products() {
  const products = useLoaderData();
  return (
    <Page>
      <Card>
        <List type="bullet" gap="loose"></List>
      </Card>
    </Page>
  );
}
