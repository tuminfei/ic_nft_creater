import { json } from "@remix-run/node";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import React from "react";
import {
  Page,
  Grid,
  MediaCard,
  BlockStack,
  CalloutCard,
} from "@shopify/polaris";
import { getStatistics } from "../models/NFTCollection.server";
import logo from "../images/logo.png";

export async function loader({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  return json(await getStatistics(shop));
}

export default function Index() {
  const statistic_data = useLoaderData();
  const [statisticState, setStatisticState] = useState(statistic_data);
  console.log(statisticState);

  return (
    <Page fullWidth>
      <BlockStack gap="500">
        <MediaCard
          title="Getting Started"
          primaryAction={{
            content: "Learn about getting started",
            onAction: () => {},
          }}
          description="Easily design NFTs on IC network and sell them on Shopify just like regular products. It's so much fun to send NFTs to your customers' emails! Discover how IC NFT Creator can power up your entrepreneurial journey."
          popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
          size="small"
        >
          <img
            alt=""
            width="100%"
            height="100%"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            src={logo}
          />
        </MediaCard>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <CalloutCard
              title="Collection"
              illustration="https://cdn.shopify.com/shopifycloud/web/assets/v1/0ecc04f85cc74cb4.svg"
              primaryAction={{
                content: "Create Collection",
                url: "/app/main_collections",
              }}
            >
              <p>Total number created:&nbsp;&nbsp;{statisticState.collection_count}</p>
              <p>Total number of sales:</p>
            </CalloutCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <CalloutCard
              title="NFT"
              illustration="https://cdn.shopify.com/shopifycloud/web/assets/v1/93a30c07e111eac4.svg"
              primaryAction={{
                content: "Mint NFT",
                url: "/app/main_nfts",
              }}
            >
              <p>Total number created:&nbsp;&nbsp;{statisticState.nft_count}</p>
              <p>Total number of sales:</p>
            </CalloutCard>
          </Grid.Cell>
        </Grid>
      </BlockStack>
    </Page>
  );
}
