import {
  BlockStack,
  Card,
  Layout,
  InlineGrid,
  Text,
  List,
} from "@shopify/polaris";

export default function CollectionInfo({ collection_info, nft_info }) {
  const name = collection_info.name;
  const description = collection_info.description;
  const canister_id = collection_info.canister_id;
  const symbol = collection_info.symbol;
  const image = collection_info.image;
  const owner = collection_info.owner;
  const nft_image = nft_info.image;
  const nft_image_source =
    nft_info.image_data != null
      ? "data:image/png;base64, " + nft_info.image_data
      : "https://cdn.shopify.com/shopifycloud/web/assets/v1/93a30c07e111eac4.svg";

  return (
    <Layout>
      <Layout.Section>
        <BlockStack gap="500">
          <Card>
            <InlineGrid columns="1fr auto">
              <Text as="h2" variant="headingSm">
                Collection Info
              </Text>
            </InlineGrid>
            <List>
              <List.Item>Name: {name}</List.Item>
              <List.Item>Symbol: {symbol}</List.Item>
              <List.Item>Description: {description}</List.Item>
              <List.Item>CanisterId: {canister_id}</List.Item>
              <List.Item>Owner: {owner}</List.Item>
              <List.Item>Collection Image: {image}</List.Item>
            </List>
          </Card>
        </BlockStack>
      </Layout.Section>
      <Layout.Section>
        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <InlineGrid columns="1fr auto">
              <Text as="h2" variant="headingSm">
                NFT Metadata
              </Text>
            </InlineGrid>
            <img
              alt=""
              width="100%"
              height="100%"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
              src={nft_image_source}
            />
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}
