import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";

import db from "../db.server";
import { getNFTCollection, validateCollection } from "../models/NFTCollection.server";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);

  if (params.id === "new") {
    return json({
      name: "",
    });
  }

  return json(await getNFTCollection(Number(params.id), admin.graphql));
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  if (data.action === "delete") {
    await db.nFTCollection.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }

  const errors = validateCollection(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const nft_collection =
    params.id === "new"
      ? await db.nFTCollection.create({ data })
      : await db.nFTCollection.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app/collections/${nft_collection.id}`);
}

export default function CollectionForm() {
  const errors = useActionData()?.errors || {};

  const nft_collection = useLoaderData();
  const [formState, setFormState] = useState(nft_collection);
  const [cleanFormState, setCleanFormState] = useState(nft_collection);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  function handleSave() {
    const data = {
      name: formState.name,
      description: formState.description || "",
      owner: formState.owner,
      symbol: formState.symbol,
      tx_window: formState.tx_window || 0,
      permitted_drift: formState.permitted_drift,
      royalties: formState.royalties || 0,
      royalties_recipient: formState.royalties_recipient || '',
      supply_cap: formState.supply_cap || '',
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={nft_collection.id ? "Edit NFT Collection" : "Create new NFT Collection"}>
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          NFT Collections
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Name
                </Text>
                <TextField
                  id="name"
                  helpText="Only store staff can see this name"
                  label="name"
                  labelHidden
                  autoComplete="off"
                  value={formState.name}
                  onChange={(name) => setFormState({ ...formState, name })}
                  error={errors.name}
                />
              </BlockStack>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                Description
                </Text>
                <TextField
                  id="description"
                  helpText="Only store staff can see this description"
                  label="description"
                  labelHidden
                  autoComplete="off"
                  value={formState.description}
                  type="text"
                  onChange={(description) => setFormState({ ...formState, description })}
                  error={errors.description}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !nft_collection.id || !nft_collection || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
