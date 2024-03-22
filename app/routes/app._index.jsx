import { json } from "@remix-run/node";
import { useState, useCallback } from "react";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import React from "react";
import {
  Page,
  Grid,
  MediaCard,
  BlockStack,
  CalloutCard,
  LegacyCard,
  Button,
  Frame,
  Modal,
  TextContainer,
  Tabs,
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
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => setActive(!active), [active]);
  const activator = <Button onClick={handleChange}>Open</Button>;

  const [selected, setSelected] = useState(0);
  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );
  const tabs = [
    {
      id: "collection-fitted-2",
      content: "1.Create Collection",
      accessibilityLabel: "All customers",
      panelID: "collection-content-2",
    },
    {
      id: "nft-fitted-2",
      content: "2.Mint NFT",
      panelID: "nft-content-2",
    },
    {
      id: "production-fitted-2",
      content: "3.Create Production",
      panelID: "production-content-2",
    },
    {
      id: "manage-fitted-2",
      content: "4.Manage NFT",
      panelID: "manage-content-2",
    },
  ];

  return (
    <Page fullWidth>
      <BlockStack gap="500">
        <MediaCard
          title="Getting Started"
          primaryAction={{
            content: "Learn about getting started",
            onAction: handleChange,
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
              <p>
                Total number created:&nbsp;&nbsp;
                {statisticState.collection_count}
              </p>
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
      <div style={{ height: "600px" }}>
        <Frame>
          <Modal
            size="large"
            open={active}
            onClose={handleChange}
            title="Instructions for use IC NFT Creator"
            primaryAction={{
              content: "Add Instagram",
              onAction: handleChange,
            }}
            secondaryActions={[
              {
                content: "Learn more",
                onAction: handleChange,
              },
            ]}
          >
            <Modal.Section>
              <LegacyCard>
                <Tabs
                  tabs={tabs}
                  selected={selected}
                  onSelect={handleTabChange}
                  fitted
                >
                  <LegacyCard.Section title={tabs[selected].content}>
                    <p>Tab {selected} selected</p>
                  </LegacyCard.Section>
                </Tabs>
              </LegacyCard>
            </Modal.Section>
          </Modal>
        </Frame>
      </div>
    </Page>
  );
}
