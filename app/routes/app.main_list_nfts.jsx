import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import {
  EmptyState,
  Layout,
  Page,
  InlineStack,
  Badge,
  Grid,
  LegacyCard,
  LegacyStack,
  ButtonGroup,
  TextField,
  List,
  Button,
  Frame,
  Modal,
} from "@shopify/polaris";

import {
  getNFTInfos,
  canisterTransferNFT,
  saveTransferNFT,
} from "../models/NFTInfo.server";
import { getSettingValue } from "../models/AppSetting.server";
import { maskAddress } from "../utils/tools";

export async function action({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  let data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  const action_name = data.action || "";

  if (action_name === "transfer_nft") {
    const nft = await canisterTransferNFT(
      parseInt(data.nft_info_id),
      data.to_pid,
      data.to_subaccount
    );
    console.log(nft);

    if ("Ok" in nft) {
      let nft_save = await saveTransferNFT(
        parseInt(data.nft_info_id),
        data.to_pid,
        data.to_subaccount
      );
      console.log(nft_save);
    }
  }
  return redirect(`/app/main_nfts/`);
}

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const nft_infos = await getNFTInfos(session.shop, admin.graphql);
  let setting_merchant_principal = await getSettingValue(
    session.shop,
    "merchant_principal"
  );
  return json({
    nft_infos,
    setting_merchant_principal,
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

export default function Index() {
  const { nft_infos, setting_merchant_principal } = useLoaderData();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [transfer_active, setTransferActive] = useState(false);
  const [merchant_principal, setMerchantPrincipal] = useState(
    setting_merchant_principal
  );
  const handleChange = useCallback(() => setActive(!active), [active]);
  const submit = useSubmit();

  const handleTransfer = (nft_info_id, nft_name, token_id, owner) => {
    setActive(!active);
    setTokenKeyState(nft_info_id);
    setTokenNameState(nft_name);
    setTokenIdState(token_id);
    setTokenOwnerState(owner);
  };

  const handleIcTransfer = () => {
    setTransferActive(true);
    const data = {
      action: "transfer_nft",
      nft_info_id: tokenKeyState,
      to_pid: tokenToState,
      to_subaccount: tokenToAccountState,
    };
    submit(data, { method: "post" });
  };

  const [tokenKeyState, setTokenKeyState] = useState("");
  const [tokenNameState, setTokenNameState] = useState("");
  const [tokenIdState, setTokenIdState] = useState("");
  const [tokenOwnerState, setTokenOwnerState] = useState("");
  const [tokenToState, setTokenToState] = useState("");
  const [tokenToAccountState, setTokenToAccountState] = useState("");

  const NFTGrid = ({ nft_infos }) => (
    <Grid>
      {nft_infos.map((nft_info) => (
        <NFTGridCell key={nft_info.id} nft_info={nft_info} />
      ))}
    </Grid>
  );

  const NFTGridCell = ({ nft_info }) => (
    <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}>
      <LegacyCard title={nft_info.name}>
        <InlineStack align="center">
          <img
            alt=""
            width="92%"
            height="250px"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            src={
              nft_info.image_data != null
                ? "data:image/png;base64, " + nft_info.image_data
                : "https://cdn.shopify.com/shopifycloud/web/assets/v1/93a30c07e111eac4.svg"
            }
          />
        </InlineStack>

        <LegacyCard.Section title="NFT Info">
          <List>
            <List.Item>
              TokenID: <Badge>{nft_info.token_id}</Badge>
            </List.Item>
            <List.Item>Description: {nft_info.description}</List.Item>
            <List.Item>Owner: {maskAddress(nft_info.owner)}</List.Item>
            <List.Item>
              Status:{" "}
              {nft_info.onchain === true ? (
                <Badge tone="success">OnChain</Badge>
              ) : (
                <Badge tone="warning">OffChain</Badge>
              )}
            </List.Item>
          </List>
        </LegacyCard.Section>
        <LegacyCard.Section>
          <LegacyStack distribution="trailing">
            <ButtonGroup>
              <Button
                onClick={() =>
                  handleTransfer(
                    nft_info.id,
                    nft_info.name,
                    nft_info.token_id,
                    nft_info.owner
                  )
                }
                disabled={nft_info.owner == merchant_principal ? false : true}
              >
                Transfer
              </Button>
              <Button
                variant="primary"
                disabled={nft_info.owner == merchant_principal ? false : true}
              >
                Create Product
              </Button>
            </ButtonGroup>
          </LegacyStack>
        </LegacyCard.Section>
      </LegacyCard>
    </Grid.Cell>
  );

  return (
    <Page
      backAction={{ content: "Products", url: "#" }}
      title="NFT List"
      titleMetadata={<Badge tone="success">minted</Badge>}
      subtitle="list you minted NFT token"
      compactTitle
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
      fullWidth
    >
      <Layout>
        <Layout.Section>
          {nft_infos.length === 0 ? (
            <EmptyNFTInfoState
              onAction={() => navigate("/app/nft_infos/new")}
            />
          ) : (
            <NFTGrid nft_infos={nft_infos} />
          )}
        </Layout.Section>
      </Layout>
      <div style={{ height: "500px" }}>
        <Frame>
          <Modal
            open={active}
            onClose={handleChange}
            title="Transfer NFT"
            size="small"
            primaryAction={{
              content: "Transfer",
              onAction: handleIcTransfer,
              loading: transfer_active,
            }}
            secondaryActions={[
              {
                content: "Cancal",
                onAction: handleChange,
              },
            ]}
          >
            <Modal.Section>
              <LegacyStack vertical>
                <TextField
                  label="Token Name"
                  autoComplete="off"
                  value={tokenNameState}
                  readOnly
                />
                <TextField
                  label="Token Id"
                  autoComplete="off"
                  value={tokenIdState}
                  readOnly
                />
                <TextField
                  label="Owner"
                  autoComplete="off"
                  value={tokenOwnerState}
                  readOnly
                />
                <TextField
                  label="To Account Principal"
                  value={tokenToState}
                  onChange={(to_pid) => setTokenToState(to_pid)}
                />
                <TextField
                  label="To Account Subaccount"
                  value={tokenToAccountState}
                  onChange={(to_acccount) =>
                    setTokenToAccountState(to_acccount)
                  }
                />
              </LegacyStack>
            </Modal.Section>
          </Modal>
        </Frame>
      </div>
    </Page>
  );
}
