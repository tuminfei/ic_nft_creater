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
  Tabs,
} from "@shopify/polaris";
import { getStatistics } from "../models/NFTCollection.server";
import logo from "../images/logo.png";
import main1 from "../images/main_index1.png";
import main2 from "../images/main_index2.png";
import main3 from "../images/main_index3.png";
import main4 from "../images/main_index4.jpeg";

import {
  ViewIcon,
  ExternalIcon,
  FolderAddIcon,
  NoteAddIcon,
} from "@shopify/polaris-icons";

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

  const tab_page1 = (
    <MediaCard
      title="ADD NFT COLLECTIONS"
      primaryAction={{
        content: "ADD NFT COLLECTIONS",
        url: "/app/main_collections",
        icon: ExternalIcon,
      }}
      description="NFT collections are groups of digital objects (artworks or other collectibles), based on the same concept."
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
        src={main1}
      />
    </MediaCard>
  );

  const tab_page2 = (
    <MediaCard
      title="ADD NFTS"
      primaryAction={{
        content: "ADD NFTS",
        url: "/app/main_nfts",
        icon: ExternalIcon,
      }}
      description="Inside these NFT Collections, you can setup and manage your NFTs (unique digital objects)."
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
        src={main2}
      />
    </MediaCard>
  );

  const tab_page3 = (
    <MediaCard
      title="CREATE PRODUCT & SELL YOUR NFTS"
      primaryAction={{
        content: "CREATE PRODUCT",
        url: "/app/main_products",
        icon: ExternalIcon,
      }}
      description="Create NFT product, Use your Shopify webshop to sell your NFTS."
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
        src={main3}
      />
    </MediaCard>
  );

  const tab_page4 = (
    <MediaCard
      title="MANAGE YOUR NFTS"
      primaryAction={{
        content: "MANAGE YOUR NFTS",
        url: "/app/main_list_nfts",
        icon: ExternalIcon,
      }}
      description="Manage your NFT products online, create small gifts, send NFTs, and more.."
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
        src={main4}
      />
    </MediaCard>
  );

  const tabs = [
    {
      id: "collection-fitted-2",
      content: "1.Create Collection",
      accessibilityLabel: "All customers",
      panelID: "collection-content-2",
      page: tab_page1,
    },
    {
      id: "nft-fitted-2",
      content: "2.Mint NFT",
      panelID: "nft-content-2",
      page: tab_page2,
    },
    {
      id: "product-fitted-2",
      content: "3.Create Product",
      panelID: "product-content-2",
      page: tab_page3,
    },
    {
      id: "manage-fitted-2",
      content: "4.Manage NFT",
      panelID: "manage-content-2",
      page: tab_page4,
    },
  ];

  const desc_str = (
    <p>
      <div>
        Easily design NFTs on IC network and sell them on Shopify just like
        regular products. It's so much fun to send NFTs to your customers'
        emails! <br />
        Discover how IC NFT Creator can power up your entrepreneurial journey.
      </div>
      <ul>
        <li>
          <b>Effortless NFT Creation</b>
        </li>
        Easily generate and deploy NFT collections on the Dfinity IC network
        directly from your Shopify store. Our intuitive interface ensures a
        seamless experience, allowing even non-technical users to harness the
        power of blockchain technology.
        <br />
        <br />
        <li>
          <b>Product Certification</b>
        </li>
        Provide authenticity and provenance to your products by creating digital
        certificates on the Dfinity IC network. Enhance customer trust and
        satisfaction by offering verifiable proof of ownership and origin.
        <br />
        <br />
        <li>
          <b>Multi-Channel Sales</b>
        </li>
        IC_NFT_Creator enables you to leverage Shopify's extensive sales
        channels to market and sell your NFT collections. Expand your reach and
        connect with a broader audience through Shopify's established e-commerce
        ecosystem.
        <br />
        <br />
      </ul>
    </p>
  );

  return (
    <Page fullWidth>
      <BlockStack gap="500">
        <MediaCard
          title="Getting Started"
          primaryAction={{
            content: "Learn about getting started",
            onAction: handleChange,
            icon: ViewIcon,
          }}
          description={desc_str}
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
                icon: FolderAddIcon,
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
                icon: NoteAddIcon,
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
              content: "Close",
              onAction: handleChange,
            }}
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
                    {tabs[selected].page}
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
