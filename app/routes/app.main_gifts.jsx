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
import { getNFTGifts } from "../models/NFTGift.server";
import { hideString } from "../utils/tools";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const gifts = await getNFTGifts(session.shop);
  return json({
    gifts,
  });
}

const NFTGiftTable = ({ nft_gifts }) => (
  <IndexTable
    resourceName={{
      singular: "NFT Gift Info",
      plural: "NFT Gift Infos",
    }}
    itemCount={nft_gifts.length}
    headings={[
      { title: "Index", hidden: true },
      { title: "Image", hidden: true },
      { title: "Gift Code" },
      { title: "Collection Name" },
      { title: "Token Id" },
      { title: "Expires At" },
      { title: "Used At" },
      { title: "Date created" },
    ]}
    selectable={false}
  >
    {nft_gifts.map((nft_gift) => (
      <NFTTableRow key={nft_gift.id} nft_gift={nft_gift} />
    ))}
  </IndexTable>
);

const NFTTableRow = ({ nft_gift }) => (
  <IndexTable.Row id={nft_gift.id} position={nft_gift.id}>
    <IndexTable.Cell>
      <Text variant="bodyMd" fontWeight="bold" as="span">
        # {nft_gift.id}
      </Text>
    </IndexTable.Cell>
    <IndexTable.Cell>
      {/* <Thumbnail
        source={"https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/gift-card-1f1f48211af3.svg" || ImageIcon}
        alt="gift"
        size="medium"
      /> */}
      <img
        alt=""
        src="https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/gift-card-1f1f48211af3.svg"
        class="_Card_hgc4v_23"
        aria-hidden="true"
      />
    </IndexTable.Cell>
    <IndexTable.Cell>{hideString(nft_gift.card_code)}</IndexTable.Cell>
    <IndexTable.Cell>{nft_gift.nft_info.name}</IndexTable.Cell>
    <IndexTable.Cell>{nft_gift.nft_info.token_id}</IndexTable.Cell>
    <IndexTable.Cell>
      {nft_gift.expires_at ? new Date(nft_gift.expires_at).toDateString() : ""}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {nft_gift.used_at ? new Date(nft_gift.used_at).toDateString() : ""}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(nft_gift.createdAt).toDateString()}
    </IndexTable.Cell>
  </IndexTable.Row>
);

export default function Products() {
  const nft_gifts = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <ui-title-bar title="NFT Product"></ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {nft_gifts.length === 0 ? (
              <EmptyCollectionState
                onAction={() => navigate("/app/collections/new")}
              />
            ) : (
              <NFTGiftTable nft_gifts={nft_gifts.gifts} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
