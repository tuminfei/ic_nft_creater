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
  LegacyStack,
  Select,
  DropZone,
  Grid,
} from "@shopify/polaris";
import { NoteMinor } from "@shopify/polaris-icons";

import db from "../db.server";
import {
  getNFTInfo,
  validateInfo,
  canisterMintNFT,
  canisterUploadImg,
  converData,
} from "../models/NFTInfo.server";
import CollectionInfo from "./collection_info";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);

  if (params.id === "new") {
    const nft_collections = await db.nFTCollection.findMany({
      where: { shop: session.shop },
      select: {
        id: true,
        name: true,
        description: true,
        symbol: true,
        image: true,
        owner: true,
        canister_id: true,
      },
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

export async function read_file(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      // Remove the prefix such as "data:application/octet-stream;base64,"
      resolve(event.target.result.split(",")[1]);
    };

    reader.onerror = function (error) {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  let data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  // upload image to canister
  if (data.file_size && parseInt(data.file_size) > 0) {
    let image_url = await canisterUploadImg(
      parseInt(data.nft_collection_id),
      parseInt(data.file_size),
      data.file_type,
      data.file_name,
      data.file_data
    );
    data.image = image_url;
  }

  const errors = validateInfo(data);
  data = converData(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  let nft_info = null;
  if (params.id === "new") {
    nft_info = await db.nFTInfo.create({ data });
    try {
      await canisterMintNFT(nft_info);
      await db.nFTInfo.update({
        where: { id: nft_info.id },
        data: { onchain: true },
      });
    } catch (error) {
      console.log(error);
      console.log("mint nft error, token_id:", nft_info.token_id);
    }
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
  const [collectionState, setCollectionState] = useState(nft_collections[0]);
  const [cleanFormState, setCleanFormState] = useState(nft_info);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  async function handleSave() {
    const data = {
      name: formState.name,
      description: formState.description || "",
      owner: formState.owner,
      token_id: formState.token_id,
      subaccount: formState.subaccount,
      image: formState.image,
      nft_collection_id: formState.nft_collection_id || nft_collections[0].id,
    };

    if (file && file.size > 0) {
      var base64data = await read_file(file);

      data["file_size"] = file.size;
      data["file_type"] = file.type;
      data["file_name"] = file.name;
      data["file_data"] = base64data;
    }

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  const [selected, setSelected] = useState(nft_collections[0].id.toString());
  const handleSelectChange = useCallback((nft_collection_id) => {
    setSelected(nft_collection_id);
    setFormState({ ...formState, nft_collection_id });
    nft_collections.map((collection) => {
      if (collection.id.toString() === nft_collection_id) {
        setCollectionState(collection);
      }
    });
  }, []);
  const options = nft_collections.map((item) => ({
    label: item.name,
    value: item.id.toString(),
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
        size="large"
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
    <Page fullWidth>
      <ui-title-bar title={nft_info.id ? "Edit NFT" : "Mint new NFT"}>
        <button
          variant="breadcrumb"
          onClick={() => navigate("/app/main_nfts/")}
        >
          NFT Infos
        </button>
      </ui-title-bar>
      <Grid columns={{ sm: 3 }}>
        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
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
                      value={formState.image}
                      onChange={(image) =>
                        setFormState({ ...formState, image })
                      }
                      error={errors.image}
                    />
                    <TextField
                      id="owner"
                      label="NFT Owner"
                      autoComplete="off"
                      value={formState.owner}
                      onChange={(owner) =>
                        setFormState({ ...formState, owner })
                      }
                      error={errors.owner}
                    />
                    <TextField
                      id="subaccount"
                      label="NFT Owner Subaccount"
                      autoComplete="off"
                      value={formState.subaccount}
                      onChange={(subaccount) =>
                        setFormState({ ...formState, subaccount })
                      }
                      error={errors.subaccount}
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
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
          <CollectionInfo collection_info={collectionState} />
        </Grid.Cell>
      </Grid>
    </Page>
  );
}
