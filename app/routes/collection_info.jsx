import {
  FormLayout,
  TextField,
  BlockStack,
  Card,
  Layout,
  InlineGrid,
  Text,
  List,
} from "@shopify/polaris";

export default function CollectionInfo({ collection_info }) {
  const name = collection_info.name;
  const description = collection_info.description;
  const canister_id = collection_info.canister_id;
  const symbol = collection_info.symbol;
  const image = collection_info.image;
  const owner = collection_info.owner;

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
    </Layout>
  );
}
