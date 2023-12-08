import { useState, useCallback } from "react";
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
  FormLayout,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
  LegacyCard,
  DropZone
} from "@shopify/polaris";
import { NoteMinor } from '@shopify/polaris-icons';

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
      permitted_drift: formState.permitted_drift || 0,
      royalties: formState.royalties,
      royalties_recipient: formState.royalties_recipient,
      supply_cap: formState.supply_cap,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  const [file, setFile] = useState();
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFile(acceptedFiles[0]),
    [],
  );

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  const fileUpload = !file && <DropZone.FileUpload />;
  const uploadedFile = file && (
    <LegacyStack>
      <Thumbnail
        size="small"
        alt={file.name}
        source={
          validImageTypes.includes(file.type)
            ? window.URL.createObjectURL(file)
            : NoteMinor
        }
      />
      <div>
        {file.name}{' '}
        <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text>
      </div>
    </LegacyStack>
  );

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
              <FormLayout>
                <TextField
                  id="name"
                  label="Name"
                  autoComplete="off"
                  value={formState.name}
                  onChange={(name) => setFormState({ ...formState, name })}
                  error={errors.name}
                  i
                />
                <TextField
                  id="description"
                  label="Description"
                  autoComplete="off"
                  value={formState.description}
                  multiline={5}
                  onChange={(description) => setFormState({ ...formState, description })}
                  error={errors.description}
                />
                <TextField
                  id="symbol"
                  label="Symbol"
                  autoComplete="off"
                  value={formState.symbol}
                  onChange={(symbol) => setFormState({ ...formState, symbol })}
                  error={errors.symbol}
                />
                <TextField
                  id="tx_window"
                  label="Tx Window"
                  autoComplete="off"
                  type="number"
                  value={formState.tx_window}
                  onChange={(tx_window) => setFormState({ ...formState, tx_window })}
                  error={errors.tx_window}
                />
                <TextField
                  id="permitted_drift"
                  label="Permitted Drift"
                  autoComplete="off"
                  type="number"
                  value={formState.permitted_drift}
                  onChange={(permitted_drift) => setFormState({ ...formState, permitted_drift })}
                  error={errors.permitted_drift}
                />
                <TextField
                  id="royalties"
                  label="Royalties"
                  autoComplete="off"
                  type="number"
                  value={formState.royalties}
                  onChange={(royalties) => setFormState({ ...formState, royalties })}
                  error={errors.royalties}
                />
                <TextField
                  id="royalties_recipient"
                  label="Royalties Recipient"
                  autoComplete="off"
                  value={formState.royalties_recipient}
                  onChange={(royalties_recipient) => setFormState({ ...formState, royalties_recipient })}
                  error={errors.royalties_recipient}
                />
                <TextField
                  id="owner"
                  label="NFT Owner"
                  autoComplete="off"
                  value={formState.owner}
                  onChange={(owner) => setFormState({ ...formState, owner })}
                  error={errors.owner}
                />
              </FormLayout>
            </Card>
            <LegacyCard title="Media" sectioned>
              <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                {uploadedFile}
                {fileUpload}
              </DropZone>
            </LegacyCard>
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
