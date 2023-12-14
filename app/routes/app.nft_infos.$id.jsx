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
  Select,
  DropZone,
} from "@shopify/polaris";
import { NoteMinor } from "@shopify/polaris-icons";

import db from "../db.server";
import { getNFTInfo, validateInfo } from "../models/NFTInfo.server";
import { Principal } from "@dfinity/principal";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const { session } = await authenticate.admin(request);

  if (params.id === "new") {
    const nft_collections = await db.nFTCollection.findMany({
      where: { shop: session.shop },
      select: { id: true, name: true },
    });
    return json({
      nft_info: {
        name: "",
        canister_id: null,
      },
      nft_collections: nft_collections,
    });
  }

  return json(await getNFTInfo(Number(params.id), admin.graphql));
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  let data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  const errors = validateInfo(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  let nft_info = null;
  if (params.id === "new") {
    nft_info = await db.nFTInfo.create({ data });
    // let rest = await canisterCreateCollection(nft_collection);
    // let nft_canister_id = Principal.from(rest).toString();
    // await db.nFTCollection.update({
    //   where: { id: nft_collection.id },
    //   data: { canister_id: nft_canister_id },
    // });
  } else {
    nft_info = await db.nFTInfo.update({
      where: { id: Number(params.id) },
      data,
    });
  }

  return redirect(`/app/main_nfts/`);
}

export default function NFTInfoForm() {
  const errors = useActionData()?.errors || {};

  const nft_info = useLoaderData().nft_info;
  const nft_collections = useLoaderData().nft_collections;
  const [formState, setFormState] = useState(nft_info);
  const [cleanFormState, setCleanFormState] = useState(nft_info);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  function handleSave() {
    const data = {
      name: formState.name,
      description: formState.description || "",
      owner: formState.owner,
      token_id: formState.token_id,
      subaccount: formState.subaccount,
      image: formState.image,
      nft_collection_id: formState.nft_collection_id,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  const [selected, setSelected] = useState("nft_collection_id");
  const handleSelectChange = useCallback((value) => setSelected(value), []);
  const options = nft_collections.map(item => ({
    label: item.name,
    value: item.id
  }));


  const [file, setFile] = useState();
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => setFile(acceptedFiles[0]),
    []
  );

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
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
        {file.name}{" "}
        <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text>
      </div>
    </LegacyStack>
  );

  return (
    <Page>
      <ui-title-bar title={nft_info.id ? "Edit NFT" : "Mint new NFT"}>
        <button
          variant="breadcrumb"
          onClick={() => navigate("/app/main_nfts/")}
        >
          NFT Infos
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <FormLayout>
                <Select
                  label="NFT Collection"
                  options={options}
                  onChange={handleSelectChange}
                  value={selected}
                />
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
                  onChange={(description) =>
                    setFormState({ ...formState, description })
                  }
                  error={errors.description}
                />
                <TextField
                  id="token_id"
                  label="Token Id"
                  autoComplete="off"
                  value={formState.token_id}
                  onChange={(token_id) =>
                    setFormState({ ...formState, token_id })
                  }
                  error={errors.token_id}
                />
                <TextField
                  id="image"
                  label="Image"
                  autoComplete="off"
                  type="number"
                  value={formState.image}
                  onChange={(image) => setFormState({ ...formState, image })}
                  error={errors.image}
                />
                <TextField
                  id="owner"
                  label="NFT Owner"
                  autoComplete="off"
                  value={formState.owner}
                  onChange={(owner) => setFormState({ ...formState, owner })}
                  error={errors.owner}
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
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
