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
  Badge,
} from "@shopify/polaris";

import { getNFTInfos } from "../models/NFTInfo.server";
import { ImageMajor } from "@shopify/polaris-icons";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const nft_infos = await getNFTInfos(session.shop, admin.graphql);
  return json({
    nft_infos,
  });
}

const EmptyNFTInfoState = ({ onAction }) => (
  <EmptyState
    heading="Mint unique NFT"
    action={{
      content: "Mint NFT",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Mint an NFT on the IC blockchain.</p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const NFTTable = ({ nft_infos }) => (
  <IndexTable
    resourceName={{
      singular: "NFT Info",
      plural: "NFT Infos",
    }}
    itemCount={nft_infos.length}
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
    {nft_infos.map((nft_info) => (
      <NFTTableRow key={nft_info.id} nft_info={nft_info} />
    ))}
  </IndexTable>
);

const NFTTableRow = ({ nft_info }) => (
  <IndexTable.Row id={nft_info.id} position={nft_info.id}>
    <IndexTable.Cell>
      <Text variant="bodyMd" fontWeight="bold" as="span">
        # {nft_info.id}
      </Text>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <Link to={`../nft_infos/${nft_info.id}`}>{truncate(nft_info.name)}</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_info.token_id}</IndexTable.Cell>
    <IndexTable.Cell>{nft_info.nft_collection.name}</IndexTable.Cell>
    <IndexTable.Cell>
      <Thumbnail
        source={nft_info.image || ImageMajor}
        alt={nft_info.name}
        size="small"
      />
    </IndexTable.Cell>
    <IndexTable.Cell>{nft_info.owner}</IndexTable.Cell>
    <IndexTable.Cell>{nft_info.product_id}</IndexTable.Cell>
    <IndexTable.Cell>
      {nft_info.onchain === true ? (
        <Badge tone="success">OnChain</Badge>
      ) : (
        <Badge tone="warning">OffChain</Badge>
      )}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(nft_info.createdAt).toDateString()}
    </IndexTable.Cell>
  </IndexTable.Row>
);

export default function Index() {
  const { nft_infos } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <ui-title-bar title="Mint NFT">
        <button
          variant="primary"
          onClick={() => navigate("/app/nft_infos/new")}
        >
          Mint NFT
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {nft_infos.length === 0 ? (
              <EmptyNFTInfoState
                onAction={() => navigate("/app/nft_infos/new")}
              />
            ) : (
              <NFTTable nft_infos={nft_infos} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
