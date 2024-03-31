import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Banner,
  BlockStack,
} from "@shopify/polaris";

import { getNFTCollections } from "../models/NFTCollection.server";
import { ImageIcon } from "@shopify/polaris-icons";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const nft_collections = await getNFTCollections(session.shop, admin.graphql);
  return json({
    nft_collections,
  });
}

const EmptyCollectionState = ({ onAction }) => (
  <EmptyState
    heading="Create unique NFT Collection"
    action={{
      content: "Create NFT Collection",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Create an NFT collection on the IC blockchain.</p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const CollectionTable = ({ nft_collections }) => (
  <IndexTable
    resourceName={{
      singular: "NFT Collection",
      plural: "NFT Collections",
    }}
    itemCount={nft_collections.length}
    headings={[
      { title: "Index", hidden: true },
      { title: "Name" },
      { title: "Symbol" },
      { title: "Thumbnail" },
      { title: "Canister Id" },
      { title: "Date created" },
      { title: "Supply Cap" },
      { title: "Cycles" },
    ]}
    selectable={false}
  >
    {nft_collections.map((nft_collection) => (
      <CollectionTableRow
        key={nft_collection.id}
        nft_collection={nft_collection}
      />
    ))}
  </IndexTable>
);

const CollectionTableRow = ({ nft_collection }) => (
  <IndexTable.Row id={nft_collection.id} position={nft_collection.id}>
    <IndexTable.Cell>
      <Text variant="bodyMd" fontWeight="bold" as="span">
        # {nft_collection.id}
      </Text>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <Link to={`../collections/${nft_collection.id}`}>
        {truncate(nft_collection.name)}
      </Link>
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_collection.symbol}</IndexTable.Cell>
    <IndexTable.Cell>
      <Thumbnail
        source={
          nft_collection.image_data
            ? "data:image/png;base64, " + nft_collection.image_data
            : ImageIcon
        }
        alt={nft_collection.name}
        size="medium"
      />
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_collection.canister_id}</IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(nft_collection.createdAt).toDateString()}
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_collection.supply_cap}</IndexTable.Cell>
    <IndexTable.Cell>{nft_collection.status_cycles}</IndexTable.Cell>
  </IndexTable.Row>
);

export default function Index() {
  const { nft_collections } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <ui-title-bar title="NFT Collections">
        <button
          variant="primary"
          onClick={() => navigate("/app/collections/new")}
        >
          Create NFT Collection
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <Banner onDismiss={() => {}}>
          <p>
            IC NFT canister needs to have enough Cycles to run. Please note the
            balance of canister cycles.&nbsp;&nbsp;
            <Link url="">Let us know what you think</Link>
          </p>
        </Banner>
        <Layout>
          <Layout.Section>
            <Card padding="0">
              {nft_collections.length === 0 ? (
                <EmptyCollectionState
                  onAction={() => navigate("/app/collections/new")}
                />
              ) : (
                <CollectionTable nft_collections={nft_collections} />
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
