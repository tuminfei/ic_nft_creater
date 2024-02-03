import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import { getProducts } from "../models/NFTProduct.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const products_node = await getProducts(session.shop, admin.graphql);
  const products = products_node.map((item) => item.node);
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
      { title: "Image", hidden: true },
      { title: "Product" },
      { title: "Collection Name" },
      { title: "Token Id" },
      { title: "Status" },
      { title: "Categroy" },
      { title: "Review" },
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
        # {nft_product.id.split("/")[4]}
      </Text>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <Thumbnail
        source={nft_product.featuredImage?.url || ImageIcon}
        alt={nft_product.name}
        size="small"
      />
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_product.title}</IndexTable.Cell>
    <IndexTable.Cell>&nbsp;</IndexTable.Cell>
    <IndexTable.Cell>&nbsp;</IndexTable.Cell>
    <IndexTable.Cell>{nft_product.status}</IndexTable.Cell>
    <IndexTable.Cell>{nft_product.productType}</IndexTable.Cell>
    <IndexTable.Cell>
      <Link to={nft_product.onlineStorePreviewUrl}>review</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(nft_product.createdAt).toDateString()}
    </IndexTable.Cell>
  </IndexTable.Row>
);

export default function Products() {
  const nft_products = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <ui-title-bar title="NFT Product"></ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {nft_products.length === 0 ? (
              <EmptyCollectionState
                onAction={() => navigate("/app/collections/new")}
              />
            ) : (
              <NFTProductTable nft_products={nft_products.products} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
